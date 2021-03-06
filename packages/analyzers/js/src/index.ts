import {
  DependencyAnalyzerResult,
  DependencyNode,
  IDependencyAnalyzer,
} from "@3d-deps/core";
import fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { debugVerbose } from "./debug";
import { postProcess, PostProcessorLabeller } from "./postProcessor";
import {
  preProcess,
  PreProcessorCleanupNodeModuleNames,
  PreProcessorCleanupPaths,
  PreProcessorHoistNodeModules,
  PreProcessorLinkWorkspaces,
  PreProcessorRelativePaths,
} from "./preProcessor";
import { TRANSFORMERS } from "./transformers";
import { getDependencies } from "./tree";
import { getTsCompilerOptions } from "./ts";
import {
  ConfigTransformer,
  FlatTree,
  FullEntry,
  NodeModulesResolution,
  PackageInfo,
  PackageJson,
} from "./types";
import { compact } from "./util";
import { getVersion } from "./version";
import { getWorkspacesInfo } from "./yarn";

const readFile = promisify(fs.readFile);

export type JsAnalyzerConfig = {
  // entry: string | string[];

  // baseDir?: string;
  // includeNpm?: boolean;
  // fileExtensions?: string[];
  // excludeRegExp?: string;
  // requireConfig?: string;
  // webpackConfig?: string;
  // tsConfig?: string;

  rootDir: string;
  configTransformer?: ConfigTransformer;
  nodeModules?: {
    resolution?: NodeModulesResolution;
  };
  workspaces?: {
    unhoist?: boolean;
    virtual?:
      | {
          packageName: string;
          location: string;
          mountPoint: string;
        }[]
      | ((d: {
          rootPkg: PackageJson;
        }) => Promise<
          {
            packageName: string;
            location: string;
            mountPoint: string;
          }[]
        >);
  };
};

const mapTreeToNodes = (tree: FlatTree): DependencyNode[] => {
  return Object.entries(tree).map(([k, vs]) => {
    const node: DependencyNode = {
      id: k,
      path: k,
      name: k,
      labels: [],
      dependsOn: vs,
    };
    return node;
  });
};

const getPackageJson = async (dir: string) => {
  const pkgFile = await readFile(path.join(dir, "package.json"));
  return JSON.parse(pkgFile.toString());
};

export const getRepository = (pkg: PackageJson) => {
  const repo = pkg.repository;
  if (typeof repo === "string") {
    return { url: repo };
  }
  if (typeof repo === "object") {
    return { url: repo.url };
  }
  return undefined;
};

const toAbsolutePath = (dir: string, p: string) => {
  return path.isAbsolute(p) ? p : path.join(dir, p);
};

const collectPackageInfo = async (
  rootDir: string,
  dir: string,
  transform: ConfigTransformer
): Promise<PackageInfo> => {
  const pkg = await getPackageJson(dir);
  const config = await transform({ dir, packageJson: pkg });
  // rootDir often lack a name, as they just delegate to other workspaces/packages
  if (!pkg.name && rootDir !== dir) {
    console.log("NO_PACKAGE_NAME", dir);
  }
  return {
    pkg,
    locationOfSrc: {
      abs: dir,
      rel: path.relative(rootDir, dir),
    },
    mountLocation: {
      abs: dir,
      rel: path.relative(rootDir, dir),
    },
    mappedEntries: config.entries.map((e) => {
      const fullE: FullEntry =
        typeof e === "string" ? { path: e, type: undefined } : e;
      const abs = toAbsolutePath(dir, fullE.path);
      return {
        abs,
        rel: path.relative(rootDir, abs),
        type: fullE.type,
      };
    }),
    configs: config.configs || {},
    // the root package might not have a name!
    locationInNodeModules: {
      abs: pkg.name ? path.join(rootDir, "node_modules", pkg.name) : "",
      rel: pkg.name ? path.join("node_modules", pkg.name) : "",
    },
    cleanupPath: config.cleanupPath,
  };
};

const collectVirtualPackageInfo = async (
  rootDir: string,
  packageName: string,
  location: string,
  mountPath: string,
  transform: ConfigTransformer
): Promise<PackageInfo> => {
  const locationOfSrc = {
    abs: path.join(rootDir, location),
    rel: path.join(location),
  };
  const pkg = await getPackageJson(locationOfSrc.abs);
  const config = await transform({ dir: locationOfSrc.abs, packageJson: pkg });

  return {
    pkg,
    locationOfSrc,
    mappedEntries: config.entries.map((e) => {
      const fullE: FullEntry =
        typeof e === "string" ? { path: e, type: undefined } : e;
      const abs = toAbsolutePath(locationOfSrc.abs, fullE.path);
      return {
        abs,
        rel: path.relative(rootDir, abs),
        type: fullE.type,
      };
    }),
    configs: config.configs || {},
    locationInNodeModules: locationOfSrc.rel.startsWith("node_modules")
      ? locationOfSrc
      : {
          rel: path.join("node_modules", packageName),
          abs: path.join(rootDir, "node_modules", packageName),
        },
    mountLocation: {
      rel: mountPath,
      abs: path.join(rootDir, mountPath),
    },
    cleanupPath: config.cleanupPath,
  };
};

export class JsAnalyzer implements IDependencyAnalyzer {
  private config: JsAnalyzerConfig;
  private caches: {
    failedLookups: { parent: string; missing: string }[];
  } = {
    failedLookups: [],
  };

  constructor(config: JsAnalyzerConfig) {
    this.config = config;
  }

  private async getVirtualWorkspaces(rootPkg: PackageJson) {
    const v = this.config.workspaces?.virtual;
    if (typeof v === "function") {
      return await v({ rootPkg });
    }
    return v || [];
  }

  async analyze() {
    const resolution = this.config.nodeModules?.resolution || "shallow";
    const { rootDir: origRootDir } = this.config;
    const rootDir = toAbsolutePath(process.cwd(), origRootDir);
    const transform = this.config.configTransformer || TRANSFORMERS.DEFAULT();
    const rootPkgInfo = await collectPackageInfo(rootDir, rootDir, transform);

    const workspaces = rootPkgInfo.pkg.workspaces
      ? await getWorkspacesInfo(rootDir)
      : {};
    const virtualWorkspaces = await this.getVirtualWorkspaces(rootPkgInfo.pkg);

    const wsPkgInfos = await Promise.all([
      ...Object.values(workspaces).map((w) =>
        collectPackageInfo(rootDir, w.location, transform)
      ),
      ...virtualWorkspaces.map((w) =>
        collectVirtualPackageInfo(
          rootDir,
          w.packageName,
          w.location,
          w.mountPoint,
          transform
        )
      ),
    ]);

    const allPkgInfos = [rootPkgInfo, ...wsPkgInfos];
    const packageNodeModulePaths = compact([
      ...allPkgInfos.map((p) => p.locationInNodeModules?.abs),
    ]);

    const packageDependencyResolveData: {
      [packageName: string]: {
        mainPathAbs: string;
        nodeModulesPathAbs: string;
      };
    } = {};
    allPkgInfos.forEach((p) => {
      const main = p.mappedEntries.find((e) => e.type === "main");
      if (main && p.locationInNodeModules?.abs) {
        packageDependencyResolveData[p.pkg.name] = {
          mainPathAbs: main.abs,
          nodeModulesPathAbs: p.locationInNodeModules.abs,
        };
      }
    });

    console.error("Traversing...");

    const tree = {};
    await Promise.all(
      allPkgInfos.map((pkgInfo) =>
        getDependencies(
          tree,
          pkgInfo,
          { resolution },
          this.caches,
          packageDependencyResolveData
        )
      )
    );

    debugVerbose("FAILED_LOOKUPS", this.caches.failedLookups);

    const relNodeModulesPathToRelMountDir: {
      [nodeModulesPath: string]: string;
    } = {};
    allPkgInfos
      .filter((p) => !!p.locationInNodeModules)
      .forEach((p) => {
        relNodeModulesPathToRelMountDir[p.locationInNodeModules!.rel] =
          p.mountLocation.rel;
      });

    console.error("Preprocess tree...");

    const preprocessed = mapTreeToNodes(
      preProcess(
        [
          PreProcessorRelativePaths(rootDir),
          PreProcessorHoistNodeModules(),
          PreProcessorLinkWorkspaces(relNodeModulesPathToRelMountDir),
          PreProcessorCleanupNodeModuleNames(),
          PreProcessorCleanupPaths(wsPkgInfos),
        ],
        tree
      )
    );

    console.error("Postprocess nodes...");

    const nodes = postProcess(
      [PostProcessorLabeller(wsPkgInfos)],
      preprocessed
    );

    const res: DependencyAnalyzerResult = {
      nodes,
      meta: {
        analyzer: {
          name: "analyzer-js",
          version: getVersion(),
        },
        repository: getRepository(rootPkgInfo.pkg),
        createdAt: new Date().toISOString(),
      },
    };

    return res;
  }
}
export { TRANSFORMERS, getTsCompilerOptions };

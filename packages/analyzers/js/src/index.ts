import {
  DependencyAnalyzerResult,
  DependencyNode,
  IDependencyAnalyzer,
} from "@3d-deps/core";
import fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { postProcess, PostProcessorLabeller } from "./postProcessor";
import {
  preProcess,
  PreProcessorCleanupNodeModuleNames,
  PreProcessorHoistNodeModules,
  PreProcessorLinkWorkspaces,
  PreProcessorRelativePaths,
  PreProcessorResolveMappedEntryFiles,
} from "./preProcessor";
import { TRANSFORMERS } from "./transformers";
import { getDependencies, mergeTrees, VisitedCache } from "./tree";
import {
  ConfigTransformer,
  FlatTree,
  FullEntry,
  NodeModulesResolution,
  PackageInfo,
  PackageJson,
} from "./types";
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
  if (!pkg.name) {
    console.log("NO_PACKAGE_NAME", dir);
  }
  return {
    pkg,
    location: {
      abs: dir,
      rel: path.relative(rootDir, dir),
    },
    mappedEntries: config.entries.map((e) => {
      const fullE: FullEntry =
        typeof e === "string" ? { path: e, type: undefined } : e;
      return {
        abs: toAbsolutePath(dir, fullE.path),
        rel: fullE.path,
        type: fullE.type,
      };
    }),
    configs: config.configs,
    // the root package might not have a name!
    nodeModulePath: pkg.name
      ? path.join(rootDir, "node_modules", pkg.name)
      : "",
  };
};

export class JsAnalyzer implements IDependencyAnalyzer {
  private config: JsAnalyzerConfig;
  private caches: {
    visited: VisitedCache;
    unresolvableModules: { entry: string; fs: string[] }[];
  } = {
    visited: [],
    unresolvableModules: [],
  };

  constructor(config: JsAnalyzerConfig) {
    this.config = config;
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

    const wsPkgInfos = await Promise.all(
      Object.values(workspaces).map(async (w) =>
        collectPackageInfo(rootDir, w.location, transform)
      )
    );

    const allPkgInfos = [rootPkgInfo, ...wsPkgInfos];

    const tree = await Promise.all(
      allPkgInfos.map((pkgInfo) =>
        getDependencies(pkgInfo, { resolution }, this.caches, allPkgInfos)
      )
    ).then(mergeTrees);

    console.log(Object.keys(tree).find((t) => t.includes("unstable_mock")));

    const preprocessed = mapTreeToNodes(
      preProcess(
        [
          PreProcessorRelativePaths(rootDir),
          PreProcessorHoistNodeModules(),
          PreProcessorLinkWorkspaces(wsPkgInfos),
          PreProcessorCleanupNodeModuleNames(),
          PreProcessorResolveMappedEntryFiles(wsPkgInfos),
        ],
        tree
      )
    );
    console.log(preprocessed.find((t) => t.id.includes("unstable_mock")));
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

export { TRANSFORMERS };

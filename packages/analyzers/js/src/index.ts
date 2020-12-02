import { DependencyNode, IDependencyAnalyzer } from "@3d-deps/shared";
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
} from "./preProcessor";
import { TRANSFORMERS } from "./transformers";
import { getDependencies, mergeTrees, VisitedCache } from "./tree";
import {
  ConfigTransformer,
  FlatTree,
  NodeModulesResolution,
  PackageInfo,
} from "./types";
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

const toNullableAbsolutePath = (dir: string, p: string | null) => {
  if (p === null) {
    return null;
  }
  return path.isAbsolute(p) ? p : path.join(dir, p);
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
  const mainAbs = toNullableAbsolutePath(dir, config.entries.main);
  return {
    pkg,
    location: {
      abs: dir,
      rel: path.relative(rootDir, dir),
    },
    mappedEntries: {
      main: {
        abs: mainAbs,
        rel: mainAbs === null ? null : path.relative(rootDir, mainAbs),
      },
      bin: config.entries.bin.map((e) => {
        const abs = toAbsolutePath(dir, e);
        return {
          abs,
          rel: path.relative(rootDir, abs),
        };
      }),
    },
    configs: config.configs,
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
        getDependencies(pkgInfo, { resolution }, this.caches)
      )
    ).then(mergeTrees);

    const nodes = mapTreeToNodes(
      preProcess(
        [
          PreProcessorRelativePaths(rootDir),
          PreProcessorHoistNodeModules(),
          PreProcessorLinkWorkspaces(wsPkgInfos),
          PreProcessorCleanupNodeModuleNames(),
        ],
        tree
      )
    );
    return postProcess([PostProcessorLabeller(wsPkgInfos)], nodes);
  }
}

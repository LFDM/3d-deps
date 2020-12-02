import { DependencyNode, IDependencyAnalyzer } from "@3d-deps/analyzer-base";
import fs from "fs";
import * as path from "path";
import { promisify } from "util";
import {
  cleanupNodeModuleNames,
  linkWorkspaces,
  mapToRelativePaths,
} from "./postprocessor";
import { TRANSFORMERS } from "./transformers";
import { getDependencies, mergeTrees, VisitedCache } from "./tree";
import {
  ConfigTransformer,
  FlatTree,
  NodeModulesResolution,
  PackageInfo,
} from "./types";
import { compact } from "./util";
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

const mapTreeToNodes = (
  tree: FlatTree,
  workspaceEntries: string[]
): DependencyNode[] => {
  const nodes: DependencyNode[] = [];
  const wsEntries = new Set(workspaceEntries);
  Object.entries(tree).forEach(([k, vs]) => {
    const groups: string[] = [];
    if (wsEntries.has(k)) {
      groups.push("workspace_entries");
    }
    if (k.includes("node_modules")) {
      groups.push("node_modules");
    }
    const node: DependencyNode = {
      id: k,
      path: k,
      label: k,
      dependsOn: vs,
    };
    if (groups.length) {
      node.groups = groups;
    }
    nodes.push(node);
  });
  return nodes;
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
  dir: string,
  transform: ConfigTransformer
): Promise<PackageInfo> => {
  const pkg = await getPackageJson(dir);
  const config = await transform({ dir, packageJson: pkg });
  return {
    pkg,
    location: dir,
    mappedEntries: {
      main: toNullableAbsolutePath(dir, config.entries.main),
      bin: config.entries.bin.map((e) => toAbsolutePath(dir, e)),
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
    const rootPkgInfo = await collectPackageInfo(rootDir, transform);

    const workspaces = rootPkgInfo.pkg.workspaces
      ? await getWorkspacesInfo(rootDir)
      : {};

    const wsPkgInfos = await Promise.all(
      Object.values(workspaces).map(async (w) =>
        collectPackageInfo(w.location, transform)
      )
    );

    const allPkgInfos = [rootPkgInfo, ...wsPkgInfos];

    const tree = await Promise.all(
      allPkgInfos.map((pkgInfo) =>
        getDependencies(pkgInfo, { resolution }, this.caches)
      )
    ).then(mergeTrees);

    const nodes = mapTreeToNodes(
      linkWorkspaces(
        rootDir,
        cleanupNodeModuleNames(mapToRelativePaths(rootDir, tree)),
        workspaces,
        compact(allPkgInfos.map((p) => p.mappedEntries.main))
      ),
      compact(allPkgInfos.map((p) => p.mappedEntries.main)).map((e) =>
        path.relative(rootDir, e)
      )
    );
    return nodes;
  }
}

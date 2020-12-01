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
  Config,
  ConfigTransformer,
  FlatTree,
  NodeModulesResolution,
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

export class JsAnalyzer implements IDependencyAnalyzer {
  private config: JsAnalyzerConfig;
  private visited: VisitedCache = {};

  constructor(config: JsAnalyzerConfig) {
    this.config = config;
  }

  async analyze() {
    const { rootDir: origRootDir } = this.config;
    const rootDir = path.isAbsolute(origRootDir)
      ? origRootDir
      : path.join(process.cwd(), origRootDir);
    const rootPkg = await getPackageJson(rootDir);
    const transform = this.config.configTransformer || TRANSFORMERS.DEFAULT();

    const workspaces = rootPkg.workspaces
      ? await getWorkspacesInfo(rootDir)
      : {};
    const resolution = this.config.nodeModules?.resolution || "shallow";
    const {
      trees: workspaceTrees,
      configs: workspaceConfigs,
    } = await Promise.all(
      Object.values(workspaces).map(async (w) => {
        const pkg = await getPackageJson(w.path);
        return getDependencies(
          w.path,
          pkg,
          transform,
          this.visited,
          resolution
        );
      })
    ).then((ws) => {
      const trees: FlatTree[] = [];
      const configs: Config[] = [];
      ws.forEach(({ tree, config }) => {
        trees.push(tree);
        configs.push(config);
      });
      return { trees, configs };
    });

    const { tree: rootTree, config: rootConfig } = await getDependencies(
      rootDir,
      rootPkg,
      transform,
      this.visited,
      resolution
    );
    const tree = mergeTrees([rootTree, ...workspaceTrees]);
    const nodes = mapTreeToNodes(
      linkWorkspaces(
        rootDir,
        cleanupNodeModuleNames(mapToRelativePaths(rootDir, tree)),
        workspaces,
        compact([
          rootConfig.entries.main,
          ...workspaceConfigs.map((w) => w.entries.main),
        ])
      ),
      compact(workspaceConfigs.map((w) => w.entries.main)).map((e) =>
        path.relative(rootDir, e)
      )
    );
    console.log(nodes);
    return nodes;
  }
}

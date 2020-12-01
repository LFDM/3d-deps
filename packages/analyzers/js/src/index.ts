import { DependencyNode, IDependencyAnalyzer } from "@3d-deps/analyzer-base";
import fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { cleanupNodeModuleNames, mapToRelativePaths } from "./postprocessor";
import { TRANSFORMERS } from "./transformers";
import { getDependencies, mergeTrees, VisitedCache } from "./tree";
import {
  Config,
  ConfigTransformer,
  FlatTree,
  NodeModulesResolution,
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
  const nodes: DependencyNode[] = [];
  Object.entries(tree).forEach(([k, vs]) => {
    nodes.push({
      id: k,
      path: k,
      label: k,
      dependsOn: vs,
    });
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
      cleanupNodeModuleNames(mapToRelativePaths(rootDir, tree))
    );
    console.log(nodes);
    return nodes;
  }
}

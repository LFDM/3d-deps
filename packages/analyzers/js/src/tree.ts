import dependencyTree, { DependencyObj } from "dependency-tree";
import * as path from "path";
import {
  ConfigTransformer,
  FlatTree,
  NodeModulesResolution,
  PackageJson,
} from "./types";

export type VisitedCache = { [key: string]: any };

export const mergeTrees = (trees: FlatTree[]) => {
  return trees.reduce<FlatTree>((m, t) => {
    Object.entries(t).forEach(([k, v]) => {
      const present = m[k];
      if (present) {
        m[k] = [...new Set([...present, ...v])];
      } else {
        m[k] = v;
      }
    });
    return m;
  }, {});
};

const flattenTree = (tree: DependencyObj, res: FlatTree = {}): FlatTree => {
  for (const key in tree) {
    const children = tree[key];
    res[key] = Object.keys(children);
    flattenTree(children, res);
  }
  return res;
};

const isNodeModule = (p: string) => p.includes("node_modules");

// TODO - pass other config
const parseEntry = (
  dir: string,
  entry: string,
  visited: VisitedCache,
  resolution: NodeModulesResolution
): FlatTree => {
  // TODO pass nonExistant and report on them
  const deepTree = dependencyTree({
    filename: entry,
    directory: dir,
    visited,
    filter: ((dependency: string, parent: string) => {
      if (resolution === "shallow") {
        if (isNodeModule(dependency) && isNodeModule(parent)) {
          return false;
        }
      }
      return true;
    }) as any, // looks like old type definition, expects only one arg, while it's really two
  });
  const flatTree = flattenTree(deepTree);
  return flatTree;
};

// TODO - pass other config
export const getDependencies = async (
  dir: string,
  pkg: PackageJson,
  transform: ConfigTransformer,
  visited: VisitedCache,
  resolution: NodeModulesResolution
) => {
  const config = await transform({
    dir: dir,
    packageJson: pkg,
  });
  config.entries.main = config.entries.main
    ? path.join(dir, config.entries.main)
    : null;
  config.entries.bin.map((p) => path.join(dir, p));

  const entryFiles: string[] = [];
  config.entries.main && entryFiles.push(config.entries.main);
  entryFiles.push(...config.entries.bin);

  const tree = mergeTrees(
    entryFiles.map((e) => parseEntry(dir, e, visited, resolution))
  );
  return { tree, config };
};

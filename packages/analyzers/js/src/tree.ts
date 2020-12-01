import dependencyTree, { DependencyObj } from "dependency-tree";
import * as path from "path";
import {
  ConfigTransformer,
  FlatTree,
  NodeModulesResolution,
  PackageJson,
} from "./types";

export type VisitedCache = { [key: string]: any };

export const mapToRelativePaths = (
  rootDir: string,
  tree: FlatTree
): FlatTree => {
  const visited: { [key: string]: string } = {};
  const res: FlatTree = {};
  const toRelative = (p: string) =>
    (visited[p] = visited[p] || path.relative(rootDir, p));
  Object.entries(tree).forEach(([k, v]) => {
    res[toRelative(k)] = v.map(toRelative);
  });
  return res;
};

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
  });
  const flatTree = flattenTree(deepTree);
  return flatTree;
};

// TODO - pass other config
export const toTree = (
  dir: string,
  entries: string[],
  visited: VisitedCache,
  resolution: NodeModulesResolution
): FlatTree => {
  const tree = mergeTrees(
    entries.map((e) => parseEntry(dir, path.join(dir, e), visited, resolution))
  );
  return tree;
};

export const getDependencies = async (
  dir: string,
  pkg: PackageJson,
  transform: ConfigTransformer,
  visited: VisitedCache,
  resolution: NodeModulesResolution
) => {
  const cfg = await transform({
    dir: dir,
    packageJson: pkg,
  });

  return toTree(dir, cfg.entries, visited, resolution);
};

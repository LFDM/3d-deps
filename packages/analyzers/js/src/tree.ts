import debugFn from "debug";
import dependencyTree, { DependencyObj, Options } from "dependency-tree";
import { CompilerOptions } from "typescript";
import { FlatTree, NodeModulesResolution, PackageInfo } from "./types";
import { compact } from "./util";

const debug = debugFn("analyzer-js");

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

type FixedDependencyTreeOptions = Omit<Options, "filter"> & {
  tsCompilerOptions?: CompilerOptions;
  filter?: (dependencyPath: string, parentPath: string) => boolean;
};

// TODO - pass other config
const parseEntry = (
  entry: string,
  pkgInfo: PackageInfo,
  options: {
    resolution: NodeModulesResolution;
  },
  caches: {
    visited: VisitedCache;
    unresolvableModules: { entry: string; fs: string[] }[];
  }
): FlatTree => {
  const nonExistent: string[] = [];
  const depTreeOptions: FixedDependencyTreeOptions = {
    filename: entry,
    directory: pkgInfo.location,
    visited: caches.visited,
    filter: (dependency: string, parent: string) => {
      if (options.resolution === "shallow") {
        if (isNodeModule(dependency) && isNodeModule(parent)) {
          return false;
        }
      }
      return true;
    },
    tsCompilerOptions: pkgInfo.configs?.ts?.compilerOptions,
    nonExistent: nonExistent,
  };

  const deepTree = dependencyTree(depTreeOptions as any);
  if (nonExistent.length) {
    caches.unresolvableModules.push({ entry, fs: nonExistent });
    debug(`nonExistent modules for ${entry}`, nonExistent);
  }
  const flatTree = flattenTree(deepTree);
  return flatTree;
};

// TODO - pass other config
export const getDependencies = async (
  pkgInfo: PackageInfo,
  options: {
    resolution: NodeModulesResolution;
  },
  caches: {
    visited: VisitedCache;
    unresolvableModules: { entry: string; fs: string[] }[];
  }
) => {
  const allEntryFiles: string[] = compact([
    pkgInfo.mappedEntries.main,
    ...pkgInfo.mappedEntries.bin,
  ]);

  const tree = mergeTrees(
    allEntryFiles.map((e) => parseEntry(e, pkgInfo, options, caches))
  );
  return tree;
};

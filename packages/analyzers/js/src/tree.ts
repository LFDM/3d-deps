import dependencyTree, { DependencyObj, Options } from "dependency-tree";
import { CompilerOptions } from "typescript";
import { FlatTree, NodeModulesResolution, PackageInfo } from "./types";

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
    if (!res[key]) {
      res[key] = Object.keys(children);
      flattenTree(children, res);
    }
  }
  return res;
};

const isNodeModule = (p: string) => p.includes("node_modules");

type FixedDependencyTreeOptions = Omit<Options, "filter"> & {
  tsCompilerOptions?: CompilerOptions;
  filter?: (dependencyPath: string, parentPath: string) => boolean;
  customFileLookup: (p: string) => string | undefined;
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
  },
  packageDependencyResolveData: {
    [packageName: string]: {
      mainPathAbs: string;
      nodeModulesPathAbs: string;
    };
  }
): FlatTree => {
  const nonExistent: string[] = [];
  const packageNodeModulePaths = Object.values(
    packageDependencyResolveData
  ).map((e) => e.nodeModulesPathAbs);
  const customFileLookup = (p: string) => {
    return packageDependencyResolveData[p]?.mainPathAbs || undefined;
  };
  const depTreeOptions: FixedDependencyTreeOptions = {
    filename: entry,
    directory: pkgInfo.locationOfSrc.abs,
    visited: caches.visited,
    filter: (dependency: string, parent: string) => {
      if (options.resolution === "shallow") {
        if (
          isNodeModule(dependency) &&
          isNodeModule(parent) &&
          !packageNodeModulePaths.find((p) => dependency.startsWith(p))
        ) {
          return false;
        }
      }
      return true;
    },
    tsCompilerOptions: pkgInfo.configs?.ts?.compilerOptions,
    nonExistent: nonExistent,
    customFileLookup,
  };

  caches.unresolvableModules.push({ entry, fs: nonExistent });

  const deepTree = dependencyTree(depTreeOptions as any);
  const flatTree = flattenTree(deepTree);
  return flatTree;
};

export const getDependencies = async (
  pkgInfo: PackageInfo,
  options: {
    resolution: NodeModulesResolution;
  },
  caches: {
    visited: VisitedCache;
    unresolvableModules: { entry: string; fs: string[] }[];
  },
  packageDependencyResolveData: {
    [packageName: string]: {
      mainPathAbs: string;
      nodeModulesPathAbs: string;
    };
  }
) => {
  const tree = mergeTrees(
    pkgInfo.mappedEntries.map((e) =>
      parseEntry(e.abs, pkgInfo, options, caches, packageDependencyResolveData)
    )
  );
  return tree;
};

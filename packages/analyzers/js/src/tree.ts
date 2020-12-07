import { lookupDependencies, LookupOptions } from "./tree-deps";
import { FlatTree, NodeModulesResolution, PackageInfo } from "./types";

const isNodeModule = (p: string) => p.includes("node_modules");

export const getDependencies = async (
  result: FlatTree,
  pkgInfo: PackageInfo,
  options: {
    resolution: NodeModulesResolution;
  },
  caches: {
    failedLookups?: { parent: string; missing: string }[];
  },
  packageDependencyResolveData: {
    [packageName: string]: {
      mainPathAbs: string;
      nodeModulesPathAbs: string;
    };
  }
) => {
  const packageNodeModulePaths = Object.values(
    packageDependencyResolveData
  ).map((e) => e.nodeModulesPathAbs);

  const opts: LookupOptions = {
    directory: pkgInfo.locationOfSrc.abs,
    tsCompilerOptions: pkgInfo.configs?.ts?.compilerOptions,
    customFileLookup: (p: string) => {
      return packageDependencyResolveData[p]?.mainPathAbs || undefined;
    },
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
    failedLookups: caches.failedLookups,
  };

  pkgInfo.mappedEntries.forEach((e) => lookupDependencies(result, e.abs, opts));
};

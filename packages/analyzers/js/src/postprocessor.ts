import * as path from "path";
import { FlatTree, Workspaces } from "./types";

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

export const cleanupNodeModuleName = (t: string): string | null => {
  if (!t.includes("node_modules")) {
    return null;
  }
  const parts = t.split("/");
  const prefixes: string[] = [];
  const res: string[] = [];
  let foundRoot = false;
  let isScoped = false;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!foundRoot && part.match(/^\.+$/)) {
      prefixes.push(part);
      continue;
    }
    if (!foundRoot && part !== "node_modules") {
      return null;
    }
    if (part === "node_modules") {
      foundRoot = true;
      continue;
    }
    if (foundRoot) {
      if (part === "@types") {
        continue;
      }
      if (part.startsWith("@")) {
        isScoped = true;
        res.push(part);
        continue;
      }
      if (isScoped && res.length === 1) {
        res.push(part);
      }
      if (res.length === 0) {
        res.push(part);
        continue;
      }
      if (res.length === 2) {
        break;
      }
    }
  }
  return res.length ? [...prefixes, "node_modules", ...res].join("/") : null;
};

export const cleanupNodeModuleNames = (tree: FlatTree) => {
  const res: FlatTree = {};
  Object.entries(tree).forEach(([k, v]) => {
    res[cleanupNodeModuleName(k) || k] = v.map(
      (x) => cleanupNodeModuleName(x) || x
    );
  });
  return res;
};

export const linkWorkspaces = (
  rootDir: string,
  tree: FlatTree,
  workspaces: Workspaces,
  entries: string[] // probably not needed after all!
): FlatTree => {
  const wsByModName: { [key: string]: string } = {};
  Object.entries(workspaces).forEach(([k, v]) => {
    const modName = path.join("node_modules", k);
    const entry = path.relative(rootDir, v.path);
    wsByModName[modName] = entry;
  });
  const modNames = Object.keys(wsByModName);
  const mappedTree: FlatTree = {};
  const dependencyResolverCache: { [key: string]: string } = {};
  Object.entries(tree).forEach(([k, vs]) => {
    const entry = wsByModName[k];
    if (entry) {
      return;
    }
    const nextVs = vs.map((v) => {
      const resolved = dependencyResolverCache[v];
      if (resolved) {
        return resolved;
      }
      if (v.startsWith("node_modules")) {
        for (const modName of modNames) {
          if (v.startsWith(modName)) {
            const entry = wsByModName[modName];
            return (dependencyResolverCache[v] = v.replace(modName, entry));
          }
        }
      }
      return v;
    });

    mappedTree[k] = nextVs;
  });
  return mappedTree;
};

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
    res[cleanupNodeModuleName(k) || k] = v;
  });
  return res;
};

export const linkWorkspaces = (
  tree: FlatTree,
  workspaces: Workspaces,
  entries: string[]
): FlatTree => {
  return tree;
};

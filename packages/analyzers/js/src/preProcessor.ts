import * as path from "path";
import { FlatTree, PackageInfo } from "./types";
import { compact, uniq } from "./util";

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

export interface PreProcessor {
  onParent: (p: string) => string | null; // null to discard
  onChild: (p: string) => string | null; // null to discard
}

// make all paths relative
// hoist all node modules
// map workspaces, so that e.g. node_modules/x -> packages/x
// cleanup node module imports (e.g. lodash/dist/x -> lodash). We might wanna allow this later
// try remap of workspace dependencies, when resolved to dist instead of src file
// mapToTreeNodes and label tree

export const PreProcessorRelativePaths = (rootDir: string): PreProcessor => {
  const toRel = (p: string) => path.relative(rootDir, p);
  return {
    onParent: toRel,
    onChild: toRel,
  };
};

export const PreProcessorHoistNodeModules = (): PreProcessor => {
  const identifier = "node_modules/";
  const hoist = (x: string) => {
    const i = x.indexOf(identifier);
    return i === -1 ? x : x.slice(i);
  };
  return {
    onParent: hoist,
    onChild: hoist,
  };
};

export const PreProcessorLinkWorkspaces = (
  wsPkgInfos: PackageInfo[]
): PreProcessor => {
  const wsByModName: { [key: string]: string } = {};
  wsPkgInfos.forEach((p) => {
    const modName = path.join("node_modules", p.pkg.name);
    const entry = p.location.rel;
    wsByModName[modName] = entry;
  });
  const modNames = Object.keys(wsByModName);

  return {
    onParent: (k) => k,
    onChild: (v) => {
      if (v.startsWith("node_modules")) {
        for (const modName of modNames) {
          if (v.startsWith(modName)) {
            const entry = wsByModName[modName];
            return v.replace(modName, entry);
          }
        }
      }
      return v;
    },
  };
};

export const PreProcessorResolveMappedEntryFiles = (
  wsPkgInfos: PackageInfo[]
): PreProcessor => {
  const dict: { [key: string]: string } = {};
  wsPkgInfos.forEach((w) => {
    const main = w.mappedEntries.main.rel;
    if (main) {
      const types = w.pkg.types; // or try to assume it's the main entry with a d.ts ext?
      if (types) {
        dict[path.join(w.location.rel, types)] = main;
      }
      const origMain = w.pkg.main;
      if (origMain) {
        dict[path.join(w.location.rel, origMain)] = main;
      }
    }

    // this duplicates knowledge of transformer and relies on list indices. need to find a better way
    const browserEntries =
      typeof w.pkg.browser === "string"
        ? [w.pkg.browser]
        : typeof w.pkg.browser === "object"
        ? Object.values(w.pkg.browser)
        : [];
    browserEntries.forEach((b, i) => {
      if (w.mappedEntries.browser[i].rel) {
        dict[path.join(w.location.rel, b)] = w.mappedEntries.browser[i].rel;
      }
    });
    const binEntries =
      typeof w.pkg.bin === "string"
        ? [w.pkg.bin]
        : typeof w.pkg.bin === "object"
        ? Object.values(w.pkg.bin)
        : [];
    binEntries.forEach((b, i) => {
      if (w.mappedEntries.bin[i].rel) {
        dict[path.join(w.location.rel, b)] = w.mappedEntries.bin[i].rel;
      }
    });
  });
  const typeDefs = new Set(Object.keys(dict));
  const mapFn = (t: string) => (typeDefs.has(t) ? dict[t] : t);
  return {
    onParent: mapFn,
    onChild: mapFn,
  };
};

export const PreProcessorCleanupNodeModuleNames = (): PreProcessor => {
  return {
    onParent: (p) => cleanupNodeModuleName(p) || p,
    onChild: (p) => cleanupNodeModuleName(p) || p,
  };
};

export const preProcess = (processors: PreProcessor[], tree: FlatTree) => {
  const cache: {
    parents: { [parent: string]: string | null };
    children: { [child: string]: string | null };
  } = {
    parents: {},
    children: {},
  };
  const result: FlatTree = {};
  Object.entries(tree).forEach(([k, vs]) => {
    const nextK = (cache.parents[k] =
      cache.parents[k] ||
      processors.reduce<string | null>((m, s) => {
        return m === null ? null : s.onParent(m);
      }, k));
    if (nextK) {
      const nextVs = compact(
        vs.map((v) => {
          return (cache.children[v] =
            cache.children[v] ||
            processors.reduce<string | null>((m, s) => {
              return m === null ? null : s.onChild(m);
            }, v));
        })
      );
      result[nextK] = uniq([...nextVs, ...(result[nextK] || [])]); // merge in case a manipulated key is already present
    }
  });
  return result;
};

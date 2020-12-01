import { DependencyNode, IDependencyAnalyzer } from "@3d-deps/analyzer-base";
import dependencyTree, { DependencyObj } from "dependency-tree";
import fs from "fs";
import * as path from "path";
import { promisify } from "util";

const readFile = promisify(fs.readFile);
const access = promisify(fs.access);

type Config = {
  entries: string[];
  // ... other stuff like tsConfig
};

type ConfigTransformer = (args: {
  dir: string;
  packageJson: PackageJson;
}) => Promise<Config | null>;

type PackageJson = object & {
  main?: string;
  bin?: string | { [key: string]: string };
  workspaces?: string[];
};

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
};

export const _toNodeModule = (t: string): string | null => {
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
  return res.length
    ? `${prefixes.join("/")}/node_modules/${res.join("/")}`
    : null;
};

type FlatTree = { [key: string]: string[] };

const _mapTreeToNodes = (tree: FlatTree): DependencyNode[] => {
  const nodes: DependencyNode[] = [];
  const nodeModules: Set<string> = new Set();
  Object.entries(tree).forEach(([k, vs]) => {
    nodes.push({
      id: k,
      path: k,
      label: k,
      dependsOn: vs.map((v) => {
        const nodeModule = _toNodeModule(v);
        if (nodeModule && !nodeModules.has(nodeModule)) {
          nodeModules.add(nodeModule);
          nodes.push({
            id: nodeModule,
            path: nodeModule,
            label: nodeModule,
            dependsOn: [],
          });
          return nodeModule;
        }
        return nodeModule || v;
      }),
    });
  });
  return nodes;
};

const flattenTree = (tree: DependencyObj, res: FlatTree = {}): FlatTree => {
  for (const key in tree) {
    const children = tree[key];
    res[key] = Object.keys(children);
    flattenTree(children, res);
  }
  return res;
};

const mapToRelativePaths = (rootDir: string, tree: FlatTree): FlatTree => {
  const visited: { [key: string]: string } = {};
  const res: FlatTree = {};
  const toRelative = (p: string) =>
    (visited[p] = visited[p] || path.relative(rootDir, p));
  Object.entries(tree).forEach(([k, v]) => {
    res[toRelative(k)] = v.map(toRelative);
  });
  return res;
};

const mergeTrees = (trees: FlatTree[]) => {
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

// TODO - pass other config
const parseEntry = (dir: string, entry: string) => {
  const deepTree = dependencyTree({
    filename: entry,
    directory: dir,
  });
  const flatTree = flattenTree(deepTree);
  return flatTree;
};

const getEntries = (pkg: PackageJson) => {
  const entries: string[] = [];
  if (pkg.main) {
    entries.push(pkg.main);
  }
  if (typeof pkg.bin === "string") {
    entries.push(pkg.bin);
  }
  if (typeof pkg.bin === "object") {
    entries.push(...Object.values(pkg.bin));
  }
  return entries;
};

const DEFAULT_TRANSFORMER = (): ConfigTransformer => {
  return async ({ packageJson }) => {
    const entries = getEntries(packageJson);
    return entries.length ? { entries } : null;
  };
};

export const TRANSFORMERS: {
  DEFAULT: () => ConfigTransformer;
  MAP_ENTRY: (mapper: (entry: string) => string | null) => ConfigTransformer;
} = {
  DEFAULT: DEFAULT_TRANSFORMER,
  MAP_ENTRY: (mapper) => async (args) => {
    const cfg = await DEFAULT_TRANSFORMER()(args);
    if (!cfg) {
      return null;
    }
    const entries: string[] = [];
    for (const e of cfg.entries) {
      const nextE = mapper(e);
      if (nextE === null) {
        return null;
      }
      entries.push(nextE);
    }
    return entries.length ? { entries } : null;
  },
};

export class JsAnalyzer implements IDependencyAnalyzer {
  private config: JsAnalyzerConfig;
  constructor(config: JsAnalyzerConfig) {
    this.config = config;
  }

  async analyze() {
    const { rootDir } = this.config;
    const pkgFile = await readFile(path.join(rootDir, "package.json"));
    const pkg = JSON.parse(pkgFile.toString());
    const transform = this.config.configTransformer || DEFAULT_TRANSFORMER();

    const cfg = await transform({
      dir: rootDir,
      packageJson: pkg,
    });

    if (!cfg) {
      return [];
    }
    const tree = mergeTrees(
      cfg.entries.map((e) => parseEntry(rootDir, path.join(rootDir, e)))
    );
    const withRelPaths = mapToRelativePaths(rootDir, tree);
    const nodes = _mapTreeToNodes(withRelPaths);
    return nodes;
  }
}

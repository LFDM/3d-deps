import { DependencyNode, IDependencyAnalyzer } from "@3d-deps/analyzer-base";
import dependencyTree, { DependencyObj } from "dependency-tree";
import fs from "fs";
import * as path from "path";
import { promisify } from "util";

const readFile = promisify(fs.readFile);
const access = promisify(fs.access);
const isDir = async (p: string) => {
  try {
    await access(p, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
};

type MadgeTree = { [key: string]: string[] };

type Config = {
  entries: string[];
  // ... other stuff like tsConfig
};

type ConfigTransformer = (
  config: Config,
  args: {
    dir: string;
    packageJson: object;
  }
) => Promise<Config | null>;

const chainTransformers = (
  transformers: ConfigTransformer[]
): ConfigTransformer => {
  const x: ConfigTransformer = async (cfg, args) => {
    let finalConfig: Config = cfg;
    for (const t of transformers) {
      const nextConf = await t(finalConfig, args);
      if (nextConf === null) {
        return null;
      }
    }
    return finalConfig;
  };
  return x;
};

export const TRANSFORMERS: {
  BUILD_TO_SOURCE: (dist: string, src: string) => ConfigTransformer;
  MAP_ENTRY: (mapper: (entry: string) => string | null) => ConfigTransformer;
} = {
  BUILD_TO_SOURCE: (dist, src) => async (cfg) => ({
    ...cfg,
    entries: cfg.entries.map((e) => e.replace(dist, src)),
  }),
  MAP_ENTRY: (mapper) => async (cfg) => {
    const entries: string[] = [];
    for (const e of cfg.entries) {
      const nextE = mapper(e);
      if (nextE === null) {
        return null;
      }
      entries.push(nextE);
    }
    return {
      ...cfg,
      entries,
    };
  },
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
  configTransformer?: (args: {
    dir: string;
    pkgJson: object;
    inferredConfig: Config;
  }) => Promise<Config | null>;
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
// convertTree(depTree, tree, pathCache) {
// 	for (const key in depTree) {
// 		const id = this.processPath(key, pathCache);
// 		if (!tree[id]) {
// 			tree[id] = [];
// 			for (const dep in depTree[key]) {
// 				tree[id].push(this.processPath(dep, pathCache));
// 			}
// 			this.convertTree(depTree[key], tree, pathCache);
// 		}
// 	}
// 	return tree;
// }

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

export class JsAnalyzer implements IDependencyAnalyzer {
  private config: JsAnalyzerConfig;
  constructor(config: JsAnalyzerConfig) {
    this.config = config;
  }

  async analyze() {
    const { rootDir } = this.config;
    const p = path.join(rootDir, "src", "index.ts");
    const pkkFile = readFile(path.join(rootDir, "package.json"));
    console.log(p);
    const deepTree = dependencyTree({
      filename: p,
      directory: rootDir,
    });
    const flatTree = flattenTree(deepTree);
    const withRelPaths = mapToRelativePaths(rootDir, flatTree);

    const nodes = _mapTreeToNodes(withRelPaths);
    return nodes;
  }
}

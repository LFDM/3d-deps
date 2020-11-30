import { DependencyNode, IDependencyAnalyzer } from "@3d-deps/analyzer-base";
// @ts-ignore
import madge from "madge";

type MadgeTree = { [key: string]: string[] };

export type MadgeAnalyzerConfig = {
  entry: string | string[];

  baseDir?: string;
  includeNpm?: boolean;
  fileExtensions?: string[];
  excludeRegExp?: string;
  requireConfig?: string;
  webpackConfig?: string;
  tsConfig?: string;
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

export const _madgeTreeToNodes = (tree: MadgeTree): DependencyNode[] => {
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

export class MadgeAnalyzer implements IDependencyAnalyzer {
  private config: MadgeAnalyzerConfig;
  constructor(config: MadgeAnalyzerConfig) {
    this.config = config;
  }

  async analyze() {
    const { entry, ...config } = this.config;
    const deps: MadgeTree = await madge(entry, {
      ...config,
      includeNpm: true,
    }).then((r: any) => r.obj());
    return _madgeTreeToNodes(deps);
  }
}

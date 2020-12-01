import { DependencyNode, IDependencyAnalyzer } from "@3d-deps/analyzer-base";
import fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { TRANSFORMERS } from "./transformers";
import { mapToRelativePaths, toTree } from "./tree";
import { ConfigTransformer, FlatTree, PackageJson } from "./types";
import { getWorkspacesInfo } from "./yarn";

const readFile = promisify(fs.readFile);

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
  workspaces?: {
    unhoist?: boolean;
  };
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

const getPackageJson = async (dir: string) => {
  const pkgFile = await readFile(path.join(dir, "package.json"));
  return JSON.parse(pkgFile.toString());
};

const getDependencies = async (
  dir: string,
  pkg: PackageJson,
  transform: ConfigTransformer
) => {
  const cfg = await transform({
    dir: dir,
    packageJson: pkg,
  });

  return toTree(dir, cfg.entries);
};

export class JsAnalyzer implements IDependencyAnalyzer {
  private config: JsAnalyzerConfig;
  constructor(config: JsAnalyzerConfig) {
    this.config = config;
  }

  async analyze() {
    const { rootDir } = this.config;
    const rootPkg = await getPackageJson(rootDir);
    const transform = this.config.configTransformer || TRANSFORMERS.DEFAULT();

    const workspaces = rootPkg.workspaces
      ? await getWorkspacesInfo(rootDir)
      : {};
    console.log(workspaces);

    const tree = await getDependencies(rootDir, rootPkg, transform);
    const nodes = _mapTreeToNodes(mapToRelativePaths(rootDir, tree));
    console.log(nodes);
    return nodes;
  }
}

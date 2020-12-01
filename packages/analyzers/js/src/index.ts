import { DependencyNode, IDependencyAnalyzer } from "@3d-deps/analyzer-base";
import fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { TRANSFORMERS } from "./transformers";
import {
  getDependencies,
  mapToRelativePaths,
  mergeTrees,
  VisitedCache,
} from "./tree";
import { ConfigTransformer, FlatTree, NodeModulesResolution } from "./types";
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
  nodeModules?: {
    resolution?: NodeModulesResolution;
  };
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
  return res.length ? [...prefixes, "node_modules", ...res].join("/") : null;
};

const mapTreeToNodes = (tree: FlatTree): DependencyNode[] => {
  const nodes: DependencyNode[] = [];
  Object.entries(tree).forEach(([k, vs]) => {
    const clean = _toNodeModule(k) || k;
    nodes.push({
      id: clean,
      path: clean,
      label: clean,
      dependsOn: vs,
    });
  });
  return nodes;
};

const getPackageJson = async (dir: string) => {
  const pkgFile = await readFile(path.join(dir, "package.json"));
  return JSON.parse(pkgFile.toString());
};

export class JsAnalyzer implements IDependencyAnalyzer {
  private config: JsAnalyzerConfig;
  private visited: VisitedCache = {};

  constructor(config: JsAnalyzerConfig) {
    this.config = config;
  }

  async analyze() {
    const { rootDir: origRootDir } = this.config;
    const rootDir = path.isAbsolute(origRootDir)
      ? origRootDir
      : path.join(process.cwd(), origRootDir);
    const rootPkg = await getPackageJson(rootDir);
    const transform = this.config.configTransformer || TRANSFORMERS.DEFAULT();

    const workspaces = rootPkg.workspaces
      ? await getWorkspacesInfo(rootDir)
      : {};
    const resolution = this.config.nodeModules?.resolution || "shallow";
    const workspaceTrees = await Promise.all(
      Object.values(workspaces).map(async (w) => {
        const pkg = await getPackageJson(w.path);
        return getDependencies(
          w.path,
          pkg,
          transform,
          this.visited,
          resolution
        );
      })
    );

    const rootTree = await getDependencies(
      rootDir,
      rootPkg,
      transform,
      this.visited,
      resolution
    );
    const tree = mergeTrees([rootTree, ...workspaceTrees]);
    const nodes = mapTreeToNodes(mapToRelativePaths(rootDir, tree));
    console.log(nodes);
    return nodes;
  }
}

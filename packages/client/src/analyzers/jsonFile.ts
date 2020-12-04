// // @ts-ignore
// import * as madge from "madge";
import { DependencyNode, IDependencyAnalyzer } from "@3d-deps/core";
// import DEPS from "./dependencies-affilimate-cli.json";

type MadgeTree = { [key: string]: string[] };

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
      name: k,
      labels: [],
      dependsOn: vs.map((v) => {
        const nodeModule = _toNodeModule(v);
        if (nodeModule && !nodeModules.has(nodeModule)) {
          nodeModules.add(nodeModule);
          nodes.push({
            id: nodeModule,
            path: nodeModule,
            name: nodeModule,
            labels: [],
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

export const FILES: {
  [name: string]: () => Promise<{ [key: string]: string[] }>;
} = {
  "Affilimate CFs": () =>
    import("./dependencies-affilimate-cf.json").then((f) => f.default),
  "Affilimate CLI": () =>
    import("./dependencies-affilimate-cli.json").then((f) => f.default),
  "Affilimate App": () =>
    import("./dependencies-affilimate-app.json").then((f) => f.default),
  "Syndexioi App": () =>
    import("./dependencies-syndexioi-app.json").then((f) => f.default),
  "Syndexioi CFs": () =>
    import("./dependencies-syndexioi-cf.json").then((f) => f.default),
  "Material UI": () => import("./dependencies-mui.json").then((f) => f.default),
  Webpack: () => import("./dependencies-webpack.json").then((f) => f.default),
  Axios: () => import("./dependencies-axios.json").then((f) => f.default),
  Express: () => import("./dependencies-express.json").then((f) => f.default),
  Self: () => import("./dependencies-self.json").then((f) => f.default),
};

export type JsonFileAnalyzerConfig = {
  key: string;
};

export class JsonFileAnalyzer implements IDependencyAnalyzer {
  private config: JsonFileAnalyzerConfig;
  constructor(config: JsonFileAnalyzerConfig) {
    this.config = config;
  }

  async analyze() {
    const x = FILES[this.config.key];
    if (!x) {
      throw new Error("UNKNWON_FILE");
    }
    return {
      nodes: _madgeTreeToNodes(await x()),
    };
  }
}

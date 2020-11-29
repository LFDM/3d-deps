// // @ts-ignore
// import * as madge from "madge";
import {
  DependencyNode,
  IDependencyAnalyzer,
} from "../types/DependencyAnalyzer";
// import DEPS from "./dependencies-affilimate-cli.json";

const dependenciesToGraphData = (deps: { [key: string]: string[] }) => {
  const nodes: DependencyNode[] = [];
  Object.entries(deps).forEach(([k, vs]) => {
    const node: DependencyNode = {
      id: k,
      path: k,
      label: k,
      dependsOn: vs.filter((v) => !v.includes("node_modules")),
    };
    nodes.push(node);
  });
  return nodes;
};

const FILES: { [name: string]: () => Promise<{ [key: string]: string[] }> } = {
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
    return dependenciesToGraphData(await x());
  }
}

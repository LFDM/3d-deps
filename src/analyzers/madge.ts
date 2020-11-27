// // @ts-ignore
// import * as madge from "madge";
import {
  DependencyNode,
  IDependencyAnalyzer,
} from "../types/DependencyAnalyzer";
import DEPS from "./dependencies-self.json";
// import DEPS from "./dependencies-syndexioi-app.json";
// import DEPS from "./dependencies-syndexioi-cf.json";
// import DEPS from "./dependencies-affilimate-app.json";
// import DEPS from "./dependencies-affilimate-cf.json";
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

export class MadgeAnalyzer implements IDependencyAnalyzer {
  private config: MadgeAnalyzerConfig;
  constructor(config: MadgeAnalyzerConfig) {
    this.config = config;
  }

  async analyze() {
    // if (process.env.NODE_ENV === "development") {
    return dependenciesToGraphData(DEPS);
    // }
    // const { entry, ...config } = this.config;
    // const deps = await madge(entry, config).then((r: any) => r.obj());
    // return dependenciesToGraphData(deps);
  }
}

// @ts-ignore
import * as madge from "madge";
import { IDependencyAnalyzer } from "../types/DependencyAnalyzer";
import { IGraphLink, IGraphNode } from "../types/GraphData";
import DEPS from "./dependencies.json";

const dependenciesToGraphData = (deps: { [key: string]: string[] }) => {
  const nodes: IGraphNode[] = [];
  const links: IGraphLink[] = [];
  Object.entries(deps).forEach(([k, vs]) => {
    const node: IGraphNode = {
      id: k,
      label: k,
    };
    nodes.push(node);
    vs.forEach((v) => {
      if (v.includes("node_modules")) {
        return;
      }
      const link: IGraphLink = {
        source: k,
        target: v,
      };
      links.push(link);
    });
  });
  return { nodes, links };
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
    if (process.env.NODE_ENV === "development") {
      return dependenciesToGraphData(DEPS);
    }
    const { entry, ...config } = this.config;
    const deps = await madge(entry, config).then((r: any) => r.obj());
    return dependenciesToGraphData(deps);
  }
}

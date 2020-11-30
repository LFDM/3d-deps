import { DependencyNode, IDependencyAnalyzer } from "@3d-deps/analyzer-base";
// @ts-ignore
import * as madge from "madge";

const dependenciesToGraphData = (deps: { [key: string]: string[] }) => {
  const nodes: DependencyNode[] = [];
  Object.entries(deps).forEach(([k, vs]) => {
    const node: DependencyNode = {
      id: k,
      path: k,
      label: k,
      dependsOn: vs,
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
    const { entry, ...config } = this.config;
    const deps = await madge(entry, config).then((r: any) => r.obj());
    return dependenciesToGraphData(deps);
  }
}

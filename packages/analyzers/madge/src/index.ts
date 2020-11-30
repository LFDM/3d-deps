import { IDependencyAnalyzer } from "@3d-deps/analyzer-base";
// @ts-ignore
import * as madge from "madge";

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

export class MadgeAnalyzer implements IDependencyAnalyzer {
  private config: MadgeAnalyzerConfig;
  constructor(config: MadgeAnalyzerConfig) {
    this.config = config;
  }

  async analyze() {
    const { entry, ...config } = this.config;
    const deps: MadgeTree = await madge(entry, config).then((r: any) =>
      r.obj()
    );
    return Object.entries(deps).map(([k, vs]) => {
      return {
        id: k,
        path: k,
        label: k,
        dependsOn: vs,
      };
    });
  }
}

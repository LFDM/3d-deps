import { DependencyAnalyzerResult } from "./analyzer";
import { Config } from "./config";

export type Dataset = {
  name: string;
  description?: string;
  icon?: string;
  fetch: () => Promise<{
    config: Config;
    data: DependencyAnalyzerResult;
  }>;
};

export type RunConfig = {
  version: number;
  loadDatasets: () => Promise<Dataset[]>;
};

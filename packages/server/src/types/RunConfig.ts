import { Config, DependencyAnalyzerResult } from "@3d-deps/core";

export type Dataset = {
  name: string;
  fetch: () => Promise<{ config: Config; data: DependencyAnalyzerResult }>;
};

export type RunConfig = {
  version: number;
  loadDatasets: () => Promise<Dataset[]>;
};

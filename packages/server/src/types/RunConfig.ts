import { Config } from "@3d-deps/config";
import { DependencyAnalyzerResult } from "@3d-deps/shared";

export type Dataset = {
  name: string;
  fetch: () => Promise<{ config: Config; data: DependencyAnalyzerResult }>;
};

export type RunConfig = {
  version: number;
  loadDatasets: () => Promise<Dataset[]>;
};

import { Config } from "@3d-deps/config";
import { DependencyNode } from "@3d-deps/shared";

export type Dataset = {
  name: string;
  fetch: () => Promise<{ config: Config; data: DependencyNode[] }>;
};

export type RunConfig = {
  version: number;
  loadDatasets: () => Promise<Dataset[]>;
};

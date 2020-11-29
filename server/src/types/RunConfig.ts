import { Config } from "./Config";
import { DependencyNode } from "./DependencyAnalyzer";

export type RunConfig = {
  version: number;
  loadDatasets: () => Promise<{
    name: string;
    fetch: () => Promise<{ config: Config; data: DependencyNode[] }>;
  }>;
};

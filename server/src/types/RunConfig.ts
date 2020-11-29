import { DependencyNode } from "./DependencyAnalyzer";

type Config = any; // TODO - move over from other project.

export type RunConfig = {
  version: number;
  loadDatasets: () => Promise<{
    name: string;
    fetch: () => Promise<{ config: Config; data: DependencyNode[] }>;
  }>;
};

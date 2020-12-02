export type DependencyNode = {
  id: string;
  path: string;
  name?: string;
  labels?: string[];
  dependsOn: string[];
};

export interface IDependencyAnalyzer {
  analyze: () => Promise<DependencyNode[]>;
}

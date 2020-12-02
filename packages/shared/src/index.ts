export type DependencyNode = {
  id: string;
  path: string;
  name?: string;
  groups?: string[];
  dependsOn: string[];
};

export interface IDependencyAnalyzer {
  analyze: () => Promise<DependencyNode[]>;
}

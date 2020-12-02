export type DependencyNode = {
  id: string;
  path: string;
  label?: string;
  groups?: string[];
  dependsOn: string[];
};

export interface IDependencyAnalyzer {
  analyze: () => Promise<DependencyNode[]>;
}

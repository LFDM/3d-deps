export type DependencyNode = {
  id: string;
  path: string;
  label?: string;
  dependsOn: string[];
};

export interface IDependencyAnalyzer {
  analyze: () => Promise<DependencyNode[]>;
}

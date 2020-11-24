type Node = {
  id: string;
  path: string;
  label?: string;
  dependsOn: string[];
};

export interface IDependencyAnalyzer {
  analyze: () => Promise<Node>;
}

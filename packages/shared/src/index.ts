export type DependencyNode = {
  id: string;
  path: string;
  name: string;
  labels: string[];
  dependsOn: string[];
};

export type DebugMessage = {
  type: string;
  msg: string;
  data?: any;
};

export type Issue = any; // TBD

export type DependencyAnalyzerMeta = {
  analyzer?: {
    name: string;
    version?: string;
  };
  createdAt: string; // iso 8601
};

export type DependencyAnalyzerResult = {
  nodes: DependencyNode[];
  debug?: DebugMessage[];
  issues?: Issue[];
  meta?: DependencyAnalyzerMeta;
};

export interface IDependencyAnalyzer {
  analyze: () => Promise<DependencyAnalyzerResult>;
}

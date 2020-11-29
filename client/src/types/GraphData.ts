export interface IGraphNode {
  id: string;
  label: string;
  path: string;
  group?: string;
  color?: string;
}

export interface IGraphLink {
  id: string;
  source: string;
  target: string;
  value?: number;
}

export type GraphData = {
  list: TreeNode[];
  byId: { [id: string]: TreeNode };
};

export type TreeNode = {
  id: string;
  label: string;
  path: string;
  group?: string; // probably don't need this
  color?: string; // probably don't need this

  dependsOn: { nodes: TreeNode[]; countWithoutExcluded: number };
  dependedBy: { nodes: TreeNode[]; countWithoutExcluded: number };
  exclude: boolean;
};

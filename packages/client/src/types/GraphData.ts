export interface IGraphNode {
  id: string;
  label: string;
  path: string;

  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
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
  name: string;
  path: string;
  labels: string[]; // probably don't need this

  dependsOn: { nodes: TreeNode[]; countDirectWithoutExcluded: number };
  dependedBy: { nodes: TreeNode[]; countDirectWithoutExcluded: number };
  exclude: boolean;
};

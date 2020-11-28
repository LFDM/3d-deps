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
  data: {
    nodes: IGraphNode[];
    links: IGraphLink[];
  };
  list: TreeNode[];
  byId: { [id: string]: TreeNode };
};

type TreeNodeOld = {
  id: string;
  label: string;
  path: string;
  group?: string; // probably don't need this
  color?: string; // probably don't need this

  node: IGraphNode;
  dependsOn: { nodes: IGraphNode[] };
  dependedBy: { nodes: IGraphNode[] };
  exclude: boolean;
};

export type TreeNodeNew = {
  id: string;
  label: string;
  path: string;
  group?: string; // probably don't need this
  color?: string; // probably don't need this

  dependsOn: { nodes: TreeNodeNew[] };
  dependedBy: { nodes: TreeNodeNew[] };
  exclude: boolean;
};

export type TreeNode = TreeNodeOld;

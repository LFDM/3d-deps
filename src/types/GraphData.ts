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
  asTree: { [id: string]: TreeNode };
  linksById: { [id: string]: IGraphLink };
  linksBySource: { [sourceId: string]: { [targetId: string]: IGraphLink[] } };
  linksByTarget: { [targetId: string]: { [sourceId: string]: IGraphLink[] } };
};

export type TreeNode = {
  node: IGraphNode;
  dependsOn: { nodes: IGraphNode[]; ids: Set<string> };
  dependedBy: { nodes: IGraphNode[]; ids: Set<string> };
  exclude: boolean;
};

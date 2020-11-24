export interface IGraphNode {
  id: string;
  label: string;
  group?: string;
  color?: string;
}

export interface IGraphLink {
  source: string;
  target: string;
  value?: number;
}

export type GraphData = {
  nodes: IGraphNode[];
  links: IGraphLink[];
};

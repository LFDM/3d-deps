export interface IGraphNode {
  id: string;
  label: string;
  path?: string;
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
  nodes: IGraphNode[];
  links: IGraphLink[];
};

import { GraphData, IGraphLink, IGraphNode } from "../types/GraphData";
import DEPS from "./dependencies.json";

export const toGraphData = (): GraphData => {
  const nodes: IGraphNode[] = [];
  const links: IGraphLink[] = [];
  Object.entries(DEPS).forEach(([k, vs]) => {
    const node: IGraphNode = {
      id: k,
      label: k,
    };
    nodes.push(node);
    vs.forEach((v) => {
      const link: IGraphLink = {
        source: v,
        target: k,
      };
      links.push(link);
    });
  });
  return { nodes, links };
};

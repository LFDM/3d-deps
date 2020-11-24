import { IDependencyAnalyzer } from "../types/DependencyAnalyzer";
import { IGraphLink, IGraphNode } from "../types/GraphData";
import DEPS from "./dependencies.json";

export class MadgeAnalyzer implements IDependencyAnalyzer {
  async analyze() {
    const nodes: IGraphNode[] = [];
    const links: IGraphLink[] = [];
    Object.entries(DEPS).forEach(([k, vs]) => {
      const node: IGraphNode = {
        id: k,
        label: k,
      };
      nodes.push(node);
      vs.forEach((v) => {
        if (v.includes("node_modules")) {
          return;
        }
        const link: IGraphLink = {
          source: k,
          target: v,
        };
        links.push(link);
      });
    });
    return { nodes, links };
  }
}

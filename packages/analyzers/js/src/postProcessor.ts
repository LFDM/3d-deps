import { DependencyNode } from "@3d-deps/shared";
import { keyBy } from "./util";

export interface PostProcessor {
  onNode: (
    node: DependencyNode,
    otherNodes: {
      list: DependencyNode[];
      byId: { [id: string]: DependencyNode };
    }
  ) => DependencyNode;
}

export const postProcess = (
  processors: PostProcessor[],
  nodes: DependencyNode[]
) => {
  const byId = keyBy(nodes, (n) => n.id);
  const otherNodes = { list: nodes, byId };
  return processors.reduce<DependencyNode[]>((m, p) => {
    return nodes.map((n) => p.onNode(n, otherNodes));
  }, nodes);
};

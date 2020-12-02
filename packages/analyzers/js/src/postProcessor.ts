import { DependencyNode } from "@3d-deps/shared";
import { PackageInfo } from "./types";
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

export const PostProcessorLabeller = (
  workspaces: PackageInfo[]
): PostProcessor => {
  return {
    onNode: (n) => {
      if (n.path.startsWith("node_modules")) {
        n.labels.push("node_module");
      }
      for (const ws of workspaces) {
        if (n.path.startsWith(ws.location.rel)) {
          n.labels.push(`workspace:${ws.pkg.name}`);
        }
        if (n.path === ws.mappedEntries.main.rel) {
          n.labels.push("workspace_entry");
        }
      }
      return n;
    },
  };
};

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

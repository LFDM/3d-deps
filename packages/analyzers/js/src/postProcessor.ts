import { DependencyNode } from "@3d-deps/core";
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
  // sort workspaces by longest to shorted location, so that we can return early
  // and avoid double labelling
  const sortedWorkspaces = [...workspaces].sort(
    (a, b) => b.location.rel.length - a.location.rel.length
  );
  return {
    onNode: (n) => {
      if (n.path.startsWith("node_modules")) {
        n.labels.push("node_module");
      }
      for (const ws of sortedWorkspaces) {
        if (n.path.startsWith(ws.location.rel)) {
          n.labels.push(`pkg:${ws.pkg.name}`);

          if (
            n.path === ws.mappedEntries.main.rel ||
            !!ws.mappedEntries.browser.find((b) => b.rel === n.path)
          ) {
            n.labels.push("pkg_entry");
          }
          break;
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

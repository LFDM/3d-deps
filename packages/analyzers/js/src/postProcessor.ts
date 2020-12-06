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
  const sortedWorkspacesWithMainEntries = [...workspaces]
    .sort((a, b) => b.locationOfSrc.rel.length - a.locationOfSrc.rel.length)
    .map((ws) => ({
      mountPoint: ws.mountLocation.rel + "/",
      name: ws.pkg.name,
      mainEntriesRel: ws.mappedEntries
        .filter((e) => e.type === "main" || "browser")
        .map((e) => e.rel),
    }));

  return {
    onNode: (n) => {
      if (n.path.startsWith("node_modules")) {
        n.labels.push("node_module");
      }
      for (const t of sortedWorkspacesWithMainEntries) {
        if (n.path.startsWith(t.mountPoint)) {
          n.labels.push(`pkg:${t.name}`);

          if (t.mainEntriesRel.includes(n.path)) {
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

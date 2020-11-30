import { keyBy } from "lodash";
import { DependencyNode } from "../types/DependencyAnalyzer";
import { TreeNode } from "../types/GraphData";

const shouldExcludeByPath = (
  path: string,
  opts: {
    includeByPath?: RegExp | null;
    excludeByPath?: RegExp | null;
  }
) => {
  console.log(opts?.includeByPath);
  if (opts?.includeByPath && !opts.includeByPath.test(path)) {
    return true;
  }
  return !!opts?.excludeByPath?.test(path);
};

export const depsToGraphData = (
  ds: DependencyNode[],
  opts?: {
    includeByPath?: RegExp | null;
    excludeByPath?: RegExp | null;
  }
): { list: TreeNode[]; byId: { [id: string]: TreeNode } } => {
  const list: TreeNode[] = [];
  const byId: { [id: string]: TreeNode } = {};
  const dsById = keyBy(ds, (d) => d.id);
  const getOrCreateTreeNode = (d: DependencyNode): TreeNode => {
    if (!byId[d.id]) {
      const exclude = shouldExcludeByPath(d.path, opts || {});
      const t: TreeNode = {
        id: d.id,
        label: d.label || d.id,
        path: d.path,
        // initialize empty, so that we can collect the object
        // before we start recursing, preventing issues with circular dependencies
        dependedBy: { nodes: [], countWithoutExcluded: 0 },
        dependsOn: { nodes: [], countWithoutExcluded: 0 },
        exclude,
      };
      byId[t.id] = t;
      list.push(t);

      d.dependsOn.forEach((nextDId) => {
        const nextD = dsById[nextDId];
        if (!nextD) {
          console.log(`No node for ${nextDId} in ${d.id} found`);
          return;
        }
        const nextT = getOrCreateTreeNode(nextD);
        t.dependsOn.nodes.push(nextT);
        nextT.dependedBy.nodes.push(t);

        if (!nextT.exclude) {
          t.dependsOn.countWithoutExcluded++;
        }
        if (!t.exclude) {
          nextT.dependedBy.countWithoutExcluded++;
        }
      });
    }
    return byId[d.id];
  };
  ds.forEach(getOrCreateTreeNode);

  return { list, byId };
};

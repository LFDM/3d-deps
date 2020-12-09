import { DependencyNode } from "@3d-deps/core";
import { keyBy } from "lodash";
import { TreeNode } from "../types/GraphData";

const shouldExcludeByPath = (
  path: string,
  opts: {
    includeByPath?: RegExp | null;
    excludeByPath?: RegExp | null;
  }
) => {
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
        name: d.name || d.id,
        path: d.path,
        labels: d.labels,
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

export const countIndirectDependencies = (ds: TreeNode[]) => {
  const counts: {
    [nodeId: string]: {
      children: number;
      parents: number;
    };
  } = {};

  const counters: {
    [nodeId: string]: {
      children: number;
      parents: number;
    }[];
  } = {};

  const traverse = (n: TreeNode) => {
    if (counts[n.id]) {
      return;
    }
    const counter = {
      children: n.dependsOn.countWithoutExcluded,
      parents: n.dependedBy.countWithoutExcluded,
    };
    counts[n.id] = counter;
    counters[n.id] = counters[n.id] || [counter];
  };
};

export const countIndirectConnectionsOfTreeNodes = (
  nodes: TreeNode[]
): { [id: string]: { children: number; parents: number } } => {
  const c: {
    [id: string]: { children: Set<string>; parents: Set<string> };
  } = {};
  let up = 0;
  let down = 0;
  const reportUp = (node: TreeNode, toReport: string) => {
    up++;
    if (node.exclude) {
      return;
    }
    const counter = (c[node.id] = c[node.id] || {
      children: new Set(),
      parents: new Set(),
    });
    if (counter.parents.has(toReport)) {
      return;
    }
    counter.parents.add(toReport);
    // node.dependsOn.nodes.forEach((c) => reportUp(c, toReport));
    for (let i = 0; i < node.dependsOn.nodes.length; i++) {
      reportUp(node.dependsOn.nodes[i], toReport);
    }
  };
  const reportDown = (node: TreeNode, toReport: string) => {
    down++;
    if (node.exclude) {
      return;
    }
    const counter = (c[node.id] = c[node.id] || {
      children: new Set(),
      parents: new Set(),
    });
    if (counter.children.has(toReport)) {
      return;
    }
    counter.children.add(toReport);
    // node.dependedBy.nodes.forEach((c) => reportDown(c, toReport));
    for (let i = 0; i < node.dependedBy.nodes.length; i++) {
      reportDown(node.dependedBy.nodes[i], toReport);
    }
  };

  nodes.forEach((n) => {
    n.dependsOn.nodes.forEach((c) => reportUp(c, n.id));
    n.dependedBy.nodes.forEach((p) => reportDown(p, n.id));
  });

  console.log({ up, down });

  return Object.entries(c)
    .map(
      ([k, counts]) =>
        [
          k,
          {
            children: counts.children.size,
            parents: counts.parents.size,
          },
        ] as const
    )
    .reduce<{ [id: string]: { children: number; parents: number } }>(
      (m, [k, counts]) => {
        m[k] = counts;
        return m;
      },
      {}
    );
};

export const countIndirectConnections = (
  nodes: {
    id: string;
    children: string[];
    parents: string[];
  }[]
): { [id: string]: { children: number; parents: number } } => {
  const c: {
    [id: string]: { children: Set<string>; parents: Set<string> };
  } = {};
  const nodesById = keyBy(nodes, (n) => n.id);
  const reportUp = (id: string, toReport: string) => {
    const node = nodesById[id];
    const counter = (c[id] = c[id] || {
      children: new Set(),
      parents: new Set(),
    });
    if (counter.parents.has(toReport)) {
      return;
    }
    counter.parents.add(toReport);
    node.children.forEach((c) => reportUp(c, toReport));
    for (let i = 0; i < node.children.length; i++) {
      reportUp(node.children[i], toReport);
    }
  };
  const reportDown = (id: string, toReport: string) => {
    const node = nodesById[id];
    const counter = (c[id] = c[id] || {
      children: new Set(),
      parents: new Set(),
    });
    if (counter.children.has(toReport)) {
      return;
    }
    counter.children.add(toReport);

    // node.parents.forEach((c) => reportDown(c, toReport));
    for (let i = 0; i < node.parents.length; i++) {
      reportDown(node.parents[i], toReport);
    }
  };

  nodes.forEach((n) => {
    n.children.forEach((c) => reportUp(c, n.id));
    n.parents.forEach((p) => reportDown(p, n.id));
  });

  return Object.entries(c)
    .map(
      ([k, counts]) =>
        [
          k,
          {
            children: counts.children.size,
            parents: counts.parents.size,
          },
        ] as const
    )
    .reduce<{ [id: string]: { children: number; parents: number } }>(
      (m, [k, counts]) => {
        m[k] = counts;
        return m;
      },
      {}
    );
};

//  Expand all subtrees, then count - probably performs worse. Routine for parents also still missing
//
// type ExpandedNode = {
//   [id: string]: ExpandedNode;
// };

// export const countIndirectConnections2 = (
//   nodes: {
//     id: string;
//     children: string[];
//     parents: string[];
//   }[]
// ): { [id: string]: { children: number; parents: number } } => {
//   const nodesById = keyBy(nodes, (n) => n.id);

//   const traverse = (
//     node: { id: string; children: string[]; parents: string[] },
//     expandedTree: {
//       [id: string]: ExpandedNode;
//     }
//   ): { [id: string]: ExpandedNode } => {
//     if (expandedTree[node.id]) {
//       return expandedTree[node.id];
//     }
//     const subTree: ExpandedNode = (expandedTree[node.id] = {});
//     node.children.forEach((childId) => {
//       const childNode = nodesById[childId];
//       const childTree = traverse(childNode, expandedTree);
//       subTree[childId] = childTree;
//     });
//     return subTree;
//   };
//   const allSubTrees: { [id: string]: ExpandedNode } = {};
//   nodes.forEach((n) => traverse(n, allSubTrees));

//   return mapValues(allSubTrees, (subTree) => {
//     const children: Set<string> = new Set();
//     const parents: Set<string> = new Set();
//     const drillDown = ([id, nextSubTree]: [string, ExpandedNode]) => {
//       children.add(id);
//       Object.entries(nextSubTree).forEach(drillDown);
//     };
//     Object.entries(subTree).forEach(drillDown);
//     return { children: children.size, parents: 0 };
//   });
// };

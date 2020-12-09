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
    node.parents.forEach((c) => reportDown(c, toReport));
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

import { groupBy, keyBy } from "lodash";
import { nanoid } from "nanoid";
import React, { useMemo, useState } from "react";
import { ForceGraph3D } from "react-force-graph";
import "./App.css";
import { Config, Theme } from "./types/Config";
import { DependencyNode } from "./types/DependencyAnalyzer";
import { GraphData, IGraphLink, IGraphNode } from "./types/GraphData";

const depsToGraphData = (ds: DependencyNode[]): GraphData => {
  const nodes: IGraphNode[] = [];
  const links: IGraphLink[] = [];
  ds.forEach((n) => {
    const node: IGraphNode = {
      id: n.id,
      label: n.label || n.id,
      path: n.path,
    };
    nodes.push(node);
    n.dependsOn.forEach((v) => {
      const link: IGraphLink = {
        id: nanoid(),
        source: n.id,
        target: v,
      };
      links.push(link);
    });
  });
  return { nodes, links };
};

const useGraphData = (ds: DependencyNode[]) => {
  return useMemo(() => {
    const depsById = keyBy(ds, (d) => d.id);
    const graphData = depsToGraphData(ds);
    const nodesById = keyBy(graphData.nodes, (n) => n.id);
    const asTree: {
      [id: string]: {
        node: IGraphNode;
        dependsOn: { nodes: IGraphNode[]; ids: Set<string> };
        dependedBy: { nodes: IGraphNode[]; ids: Set<string> };
      };
    } = {};
    const getOrCreateTreeNode = (n: IGraphNode) => {
      if (!asTree[n.id]) {
        asTree[n.id] = {
          node: n,
          dependsOn: {
            nodes: depsById[n.id].dependsOn.map((c) => nodesById[c]),
            ids: new Set(depsById[n.id].dependsOn),
          },
          dependedBy: { nodes: [], ids: new Set() },
        };
      }
      return asTree[n.id];
    };
    graphData.nodes.forEach((n) => {
      const treeNode = getOrCreateTreeNode(n);
      treeNode.dependsOn.nodes.forEach((child) => {
        const childTreeNode = getOrCreateTreeNode(child);
        childTreeNode.dependedBy.nodes.push(n);
        childTreeNode.dependedBy.ids.add(n.id);
      });
    });

    return {
      graphData,
      asTree,
      linksBySource: groupBy(graphData.links, (l) => l.source),
      linksByTarget: groupBy(graphData.links, (l) => l.target),
    };
  }, [ds]);
};

const Graph = ({ ds, theme }: { ds: DependencyNode[]; theme: Theme }) => {
  // TODO
  // onSelect:
  // - hightlight node
  // - incoming deps -> 2-3 layers
  // - outgoing deps -> 2-3 layers
  // - all links between them, activate particles
  const g = useGraphData(ds);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const styles = useMemo(() => {
    const ss: {
      nodes: {
        [id: string]: {
          color?: string;
        };
      };
      links: {
        [id: string]: {
          color?: string;
          particles?: number;
        };
      };
    } = {
      nodes: {},
      links: {},
    };
    if (selectedNodeId) {
      const treeNode = g.asTree[selectedNodeId];
      treeNode.dependsOn.nodes.forEach((n) => {
        ss.nodes[n.id] = { color: theme.graph.colors.dependent };
      });
      treeNode.dependedBy.nodes.forEach((n) => {
        ss.nodes[n.id] = { color: theme.graph.colors.dependency };
      });

      const sourceLinks = g.linksBySource[selectedNodeId] || [];
      sourceLinks.forEach((l) => {
        ss.links[l.id] = { particles: 7 };
      });
      const targetLinks = g.linksByTarget[selectedNodeId] || [];
      targetLinks.forEach((l) => {
        ss.links[l.id] = { particles: 7 };
      });
    }

    return ss;
  }, [g, selectedNodeId, theme]);

  // might be better to compute style objects for everything
  // - and then just use these vars in the respective functions
  return (
    <ForceGraph3D
      graphData={g.graphData}
      nodeId="id"
      nodeColor={(node: any) => {
        return styles.nodes[node.id]?.color || theme.graph.colors.standard;
      }}
      linkDirectionalParticles={(link: any) => {
        return styles.links[link.id]?.particles || 0;
      }}
      linkDirectionalArrowLength={3.5}
      linkDirectionalArrowRelPos={1}
      nodeLabel={(node) => (node as IGraphNode).label}
      enableNodeDrag={false}
      onNodeClick={(node) =>
        setSelectedNodeId((s) => (s === node.id! ? null : `${node.id!}`))
      }
    />
  );
};

function App({ config, ds }: { config: Config; ds: DependencyNode[] }) {
  return (
    <div className="App">
      <main>
        <Graph ds={ds} theme={config.theme} />
      </main>
    </div>
  );
}

export default App;

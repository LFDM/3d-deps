import { groupBy, keyBy } from "lodash";
import React, { useMemo, useState } from "react";
import { ForceGraph3D } from "react-force-graph";
import "./App.css";
import { Config } from "./types/Config";
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

const Graph = ({ ds }: { ds: DependencyNode[] }) => {
  // TODO
  // onSelect:
  // - hightlight node
  // - incoming deps -> 2-3 layers
  // - outgoing deps -> 2-3 layers
  // - all links between them, activate particles
  const { graphData, asTree, linksBySource, linksByTarget } = useGraphData(ds);
  console.log(asTree);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  return (
    <ForceGraph3D
      graphData={graphData}
      nodeId="id"
      nodeColor={(node: any) => {
        if (node.id === selectedNodeId) {
          return "lightblue";
        }
        if (selectedNodeId) {
          const treeNode = asTree[selectedNodeId];
          if (treeNode.dependsOn.ids.has(node.id)) {
            return "green";
          }
          if (treeNode.dependedBy.ids.has(node.id)) {
            return "red";
          }
        }
        return "";
      }}
      linkDirectionalParticles={(link: any) => {
        if (selectedNodeId) {
          const sourced = linksBySource[selectedNodeId] || [];
          if (sourced.includes(link)) {
            return 7;
          }
          const targetted = linksByTarget[selectedNodeId] || [];
          if (targetted.includes(link)) {
            return 7;
          }
        }
        return 0;
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
        <Graph ds={ds} />
      </main>
    </div>
  );
}

export default App;

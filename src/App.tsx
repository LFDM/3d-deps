import { keyBy } from "lodash";
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
    const tree = graphData.nodes.map((node) => {
      return {
        node,
        children: depsById[node.id].dependsOn.map((c) => nodesById[c]),
      };
    });
    return {
      graphData,
      tree,
      linksBySource: keyBy(graphData.links, (l) => l.source),
      linksByTarget: keyBy(graphData.links, (l) => l.target),
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
  const { graphData } = useGraphData(ds);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  return (
    <ForceGraph3D
      graphData={graphData}
      nodeId="id"
      nodeColor={(node: any) => {
        if (node.id === selectedNodeId) {
          return "lightblue";
        }
        return "";
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

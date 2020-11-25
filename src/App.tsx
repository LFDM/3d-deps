import React, { useEffect, useMemo, useState } from "react";
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
    return {
      graphData: depsToGraphData(ds),
    };
  }, [ds]);
};

const Graph = ({ ds }: { ds: DependencyNode[] }) => {
  // TODO
  // create lookup containers
  // - nodes as a tree
  // - links by source
  // - links by target

  // onSelect:
  // - hightlight node
  // - incoming deps -> 2-3 layers
  // - outgoing deps -> 2-3 layers
  // - all links between them, activate particles
  const { graphData } = useGraphData(ds);
  const [i, setI] = useState(0);
  useEffect(() => {
    setInterval(() => {
      setI(Math.floor(Math.random() * graphData.nodes.length));
    }, 500);
  }, []);
  return (
    <ForceGraph3D
      graphData={graphData}
      nodeId="id"
      nodeColor={(node: any) => {
        if (graphData.nodes[i] === node) {
          return "red";
        }
        return "";
      }}
      linkDirectionalArrowLength={3.5}
      linkDirectionalArrowRelPos={1}
      nodeLabel={(node) => (node as IGraphNode).label}
      enableNodeDrag={false}
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

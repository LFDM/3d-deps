import React, { useEffect, useState } from "react";
import { ForceGraph3D } from "react-force-graph";
import "./App.css";
import { Config } from "./types/Config";
import { DependencyNode } from "./types/DependencyAnalyzer";
import { IGraphNode } from "./types/GraphData";

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
  const [i, setI] = useState(0);
  useEffect(() => {
    setInterval(() => {
      setI(Math.floor(Math.random() * d.nodes.length));
    }, 500);
  }, []);
  return (
    <ForceGraph3D
      graphData={d}
      nodeId="id"
      nodeColor={(node: any) => {
        if (d.nodes[i] === node) {
          return "red";
        }
        return "";
      }}
      linkDirectionalArrowLength={3.5}
      linkDirectionalArrowRelPos={1}
      nodeLabel={(node) => (node as IGraphNode).id}
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

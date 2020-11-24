import React, { useEffect, useState } from "react";
import { ForceGraph3D } from "react-force-graph";
import "./App.css";
import { Config } from "./types/Config";
import { GraphData, IGraphNode } from "./types/GraphData";

const Graph = ({ d }: { d: GraphData }) => {
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

function App({ config }: { config: Config }) {
  return (
    <div className="App">
      <main>
        <Graph d={config.data} />
      </main>
    </div>
  );
}

export default App;

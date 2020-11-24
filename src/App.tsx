import React, { useEffect, useState } from "react";
import { ForceGraph3D } from "react-force-graph";
import "./App.css";
import { toGraphData } from "./services/madge";
import { GraphData, IGraphNode } from "./types/GraphData";

const Graph = ({ d }: { d: GraphData }) => {
  const [nodes, setNodes] = useState(d.nodes);
  useEffect(() => {
    setInterval(() => {
      const i = Math.floor(Math.random() * d.nodes.length);
      const node = d.nodes[i];
      console.log(node); // remove this line and fast-refresh to get a cool explosion!
      node.color = "red";
      setNodes([...d.nodes]);
    }, 1000);
  }, []);
  return (
    <ForceGraph3D
      graphData={{
        nodes,
        links: d.links,
      }}
      nodeId="id"
      linkDirectionalArrowLength={3.5}
      linkDirectionalArrowRelPos={1}
      nodeLabel={(node) => (node as IGraphNode).id}
    />
  );
};

function App() {
  const graphData = toGraphData();
  console.log(graphData);
  return (
    <div className="App">
      <main>
        <Graph d={graphData} />
      </main>
    </div>
  );
}

export default App;

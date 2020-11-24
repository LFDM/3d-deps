import React from "react";
import { ForceGraph3D } from "react-force-graph";
import "./App.css";
import { toGraphData } from "./services/madge";
import { GraphData } from "./types/GraphData";

const Graph = ({ d }: { d: GraphData }) => {
  return <ForceGraph3D graphData={d} nodeId="id" nodeAutoColorBy="group" />;
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

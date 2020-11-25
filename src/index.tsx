import React from "react";
import ReactDOM from "react-dom";
import { MadgeAnalyzer } from "./analyzers/madge";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { Theme } from "./types/Config";

const THEME: Theme = {
  graph: {
    nodes: {
      colors: {
        standard: "#fcf4b0",
        selected: "#e8a838",
        unselected: "black",
        dependency: "#f47560",
        dependent: "#61cdbb",
      },
    },
    links: {
      colors: {
        standard: "lightgray",
        dependency: "#f47560",
        dependent: "#61cdbb",
      },
    },
  },
};

const run = async () => {
  const ds = await new MadgeAnalyzer({
    entry: "...",
  })
    .analyze()
    .then();
  ReactDOM.render(
    <React.StrictMode>
      <App config={{ theme: THEME }} ds={ds} />
    </React.StrictMode>,
    document.getElementById("root")
  );
};

run();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

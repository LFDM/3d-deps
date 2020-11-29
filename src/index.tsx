import React from "react";
import ReactDOM from "react-dom";
import { JsonFileAnalyzer } from "./analyzers/jsonFile";
import { MadgeAnalyzer } from "./analyzers/madge";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { Dataset } from "./services/dataset";
import { CONFIG } from "./types/Config";

const toDataset = (key: string): Dataset => ({
  name: key,
  fetch: async () => ({
    config: CONFIG,
    data: await new JsonFileAnalyzer({ key }).analyze(),
  }),
});

const run = async () => {
  await new MadgeAnalyzer({
    entry: "...",
  }).analyze();
  ReactDOM.render(
    <React.StrictMode>
      <App
        ds={[
          toDataset("Affilimate CFs"),
          toDataset("Affilimate CLI"),
          toDataset("Affilimate App"),
          toDataset("Syndexioi App"),
          toDataset("Syndexioi CFs"),
          toDataset("Self"),
        ]}
      />
    </React.StrictMode>,
    document.getElementById("root")
  );
};

run();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

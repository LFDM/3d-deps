import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { Dataset } from "./services/dataset";

console.log(process.env.STANDALONE);

const loadDatasets: () => Promise<Dataset[]> = !!process.env.STANDALONE
  ? async () => import("./exampleLoader").then((m) => m.loadDatasets())
  : async () => fetch("/api/datasets").then((r) => r.json());

const run = async () => {
  ReactDOM.render(
    <React.StrictMode>
      <App loadDatasets={loadDatasets} />
    </React.StrictMode>,
    document.getElementById("root")
  );
};

run();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

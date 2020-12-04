import { Dataset, deserializeConfig } from "@3d-deps/core";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

// TODO use another env var - one that gets mangled by webpack, so
// that the development code path is removed entirely
// Maybe we need to do this as a custom build step though...
const loadDatasets: () => Promise<Dataset[]> = !!process.env
  .REACT_APP_STANDALONE
  ? async () =>
      import("@3d-deps/gallery").then((m) => m.getConfig().loadDatasets())
  : async () =>
      fetch("/api/datasets").then(async (r) => {
        const datasets: { name: string; id: string }[] = await r.json();
        return datasets.map((d) => ({
          name: d.name,
          fetch: async () => {
            const res = await fetch(`/api/datasets/${d.id}`);
            const { config, data } = await res.json();
            return {
              config: deserializeConfig(config),
              data,
            };
          },
        }));
      });

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

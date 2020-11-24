import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { MadgeAnalyzer } from "./services/madge";

const run = async () => {
  const data = await new MadgeAnalyzer().analyze().then();
  ReactDOM.render(
    <React.StrictMode>
      <App config={{ data }} />
    </React.StrictMode>,
    document.getElementById("root")
  );
};

run();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

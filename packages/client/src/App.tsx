import {
  CONFIG,
  Config,
  Dataset,
  DependencyAnalyzerResult,
  DependencyNode,
} from "@3d-deps/core";
import { ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";
import assertNever from "assert-never";
import React, { useMemo, useState } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Graph } from "./components/Graph";
import { Helmet } from "./components/Helmet";
import { Hud } from "./components/Hud";
import { InitCanvas } from "./components/InitCanvas";
import { CssBaseline } from "./CssBaseline";
import { usePromise } from "./hooks/usePromise";
import { ConfigContext } from "./services/config";
import { DatasetProvider, useDatasets } from "./services/dataset";
import { depsToGraphData } from "./services/graph";
import { UiStateProvider } from "./services/uiState";
import { GraphData } from "./types/GraphData";

const Main = styled(CssBaseline)((p) => ({
  backgroundColor: p.theme.typography.backgroundColor,
  color: p.theme.typography.color,
  width: "100vw",
  height: "100vh",
  overflow: "hidden",
}));

const useGraphData = (
  ds: DependencyNode[],
  {
    includeByPath,
    excludeByPath,
  }: {
    includeByPath?: RegExp | null;
    excludeByPath?: RegExp | null;
  }
): GraphData => {
  return useMemo(
    () =>
      depsToGraphData(ds, {
        includeByPath,
        excludeByPath,
      }),
    [ds, includeByPath, excludeByPath]
  );
};

const AppReady = ({
  name,
  config: originalConfig,
  data,
}: {
  name: string;
  config: Config;
  data: DependencyAnalyzerResult;
}) => {
  const [config, setConfig] = useState(originalConfig);
  const g = useGraphData(data.nodes, {
    includeByPath: config.graph.includeByPath,
    excludeByPath: config.graph.excludeByPath,
  });
  return (
    <ConfigContext.Provider
      value={{
        current: config,
        original: originalConfig,
        onChange: setConfig,
      }}
    >
      <ThemeProvider theme={config.theme}>
        <UiStateProvider data={g}>
          <Helmet title={name} />
          <Main as="main">
            <Hud />
            <Graph />
          </Main>
        </UiStateProvider>
      </ThemeProvider>
    </ConfigContext.Provider>
  );
};

const AppLoading = ({ name }: { name: string }) => {
  return (
    <InitCanvas title={name}>
      Loading <b>{name}</b>...
    </InitCanvas>
  );
};

const AppError = ({ name, error }: { name: string; error: string }) => {
  console.log(error);
  return (
    <InitCanvas title={name}>
      Something went wrong while loading <b>{name}</b>!
    </InitCanvas>
  );
};

const AppInit = () => {
  const { current } = useDatasets();
  switch (current.state) {
    case "LOADING":
      return <AppLoading name={current.name} />;
    case "ERROR":
      return <AppError name={current.name} error={current.err} />;
    case "READY":
      return (
        <AppReady
          name={current.name}
          data={current.data}
          config={current.config}
        />
      );
    default:
      return assertNever(current);
  }
};

function App({ loadDatasets }: { loadDatasets: () => Promise<Dataset[]> }) {
  // leave router outside so that we can switch datasets through urls later
  const [datasets, loading, error] = usePromise(loadDatasets);
  if (error) {
    console.error(error);
  }
  return (
    <ThemeProvider theme={CONFIG.theme}>
      <Router>
        {loading && <InitCanvas>Loading datasets...</InitCanvas>}
        {error ||
          (!datasets && <InitCanvas>Failed to load datasets.</InitCanvas>)}
        {datasets && !datasets.length && (
          <InitCanvas>No datasets provided.</InitCanvas>
        )}
        {datasets && datasets.length && (
          <DatasetProvider datasets={datasets}>
            <Route path="/browser" exact>
              <InitCanvas>
                <div> Browser!</div>
              </InitCanvas>
            </Route>
            <Route path="/" exact>
              <AppInit />
            </Route>
          </DatasetProvider>
        )}
      </Router>
    </ThemeProvider>
  );
}

export default App;

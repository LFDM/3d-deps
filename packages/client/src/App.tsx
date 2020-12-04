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
import { BrowserRouter as Router } from "react-router-dom";
import { Graph } from "./components/Graph";
import { Helmet } from "./components/Helmet";
import { Hud } from "./components/Hud";
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
  config: originalConfig,
  data,
}: {
  name: string;
  config: Config;
  data: DependencyAnalyzerResult;
}) => {
  const { current } = useDatasets();
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
          <Helmet title={current.name} />
          <Main as="main">
            <Hud />
            <Graph />
          </Main>
        </UiStateProvider>
      </ThemeProvider>
    </ConfigContext.Provider>
  );
};

const InitCanvas: React.FC<{ title?: string }> = ({ title, children }) => {
  const t = CONFIG.theme;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        font: t.typography.font,
        height: "100vh",
        width: "100vw",
        backgroundColor: t.typography.backgroundColor,
        color: t.typography.color,
      }}
    >
      <Helmet title={title} />
      <div>{children}</div>
    </div>
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
  if (loading) {
    return <InitCanvas>Loading datasets...</InitCanvas>;
  }
  if (error || !datasets) {
    console.log(error);
    return <InitCanvas>Failed to load datasets.</InitCanvas>;
  }
  if (!datasets.length) {
    return <InitCanvas>No datasets provided.</InitCanvas>;
  }
  return (
    <Router>
      <DatasetProvider datasets={datasets}>
        <AppInit />
      </DatasetProvider>
    </Router>
  );
}

export default App;

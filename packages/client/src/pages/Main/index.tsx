import {
  Config,
  DependencyAnalyzerResult,
  DependencyNode,
} from "@3d-deps/core";
import { ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";
import assertNever from "assert-never";
import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Graph } from "../../components/Graph";
import { Hud } from "../../components/Hud";
import { InitCanvas } from "../../components/InitCanvas";
import { CssBaseline } from "../../CssBaseline";
import { ConfigContext } from "../../services/config";
import { useDatasets } from "../../services/dataset";
import { depsToGraphData } from "../../services/graph";
import { UiStateProvider } from "../../services/uiState";
import { GraphData } from "../../types/GraphData";

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

export const PageMain = () => {
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

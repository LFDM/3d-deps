import { CONFIG, Config } from "@3d-deps/config";
import { ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";
import assertNever from "assert-never";
import { keyBy } from "lodash";
import React, { useMemo, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Graph } from "./components/Graph";
import { Hud } from "./components/Hud";
import { CssBaseline } from "./CssBaseline";
import { usePromise } from "./hooks/usePromise";
import { ConfigContext } from "./services/config";
import { Dataset, DatasetProvider, useDatasets } from "./services/dataset";
import { UiStateProvider } from "./services/uiState";
import { DependencyNode } from "./types/DependencyAnalyzer";
import { GraphData, TreeNode } from "./types/GraphData";

const Main = styled(CssBaseline)((p) => ({
  backgroundColor: p.theme.typography.backgroundColor,
  color: p.theme.typography.color,
  width: "100vw",
  height: "100vh",
  overflow: "hidden",
}));

const shouldExcludeByPath = (
  path: string,
  opts: {
    includeByPath?: RegExp | null;
    excludeByPath?: RegExp | null;
  }
) => {
  console.log(opts?.includeByPath);
  if (opts?.includeByPath && !opts.includeByPath.test(path)) {
    return true;
  }
  return !!opts?.excludeByPath?.test(path);
};

const depsToGraphData = (
  ds: DependencyNode[],
  opts?: {
    includeByPath?: RegExp | null;
    excludeByPath?: RegExp | null;
  }
): { list: TreeNode[]; byId: { [id: string]: TreeNode } } => {
  const list: TreeNode[] = [];
  const byId: { [id: string]: TreeNode } = {};
  const dsById = keyBy(ds, (d) => d.id);
  const getOrCreateTreeNode = (d: DependencyNode): TreeNode => {
    if (!byId[d.id]) {
      const exclude = shouldExcludeByPath(d.path, opts || {});
      const t: TreeNode = {
        id: d.id,
        label: d.label || d.id,
        path: d.path,
        // initialize empty, so that we can collect the object
        // before we start recursing, preventing issues with circular dependencies
        dependedBy: { nodes: [], countWithoutExcluded: 0 },
        dependsOn: { nodes: [], countWithoutExcluded: 0 },
        exclude,
      };
      byId[t.id] = t;
      list.push(t);

      d.dependsOn.forEach((nextDId) => {
        const nextD = dsById[nextDId];
        if (!nextD) {
          console.log(`No node for ${nextDId} in ${d.id} found`);
          return;
        }
        const nextT = getOrCreateTreeNode(nextD);
        t.dependsOn.nodes.push(nextT);
        nextT.dependedBy.nodes.push(t);

        if (!nextT.exclude) {
          t.dependsOn.countWithoutExcluded++;
        }
        if (!t.exclude) {
          nextT.dependedBy.countWithoutExcluded++;
        }
      });
    }
    return byId[d.id];
  };
  ds.forEach(getOrCreateTreeNode);

  return { list, byId };
};

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
  data: DependencyNode[];
}) => {
  const [config, setConfig] = useState(originalConfig);
  const g = useGraphData(data, {
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
          <Main as="main">
            <Hud />
            <Graph />
          </Main>
        </UiStateProvider>
      </ThemeProvider>
    </ConfigContext.Provider>
  );
};

const InitCanvas: React.FC = ({ children }) => {
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
      <div>{children}</div>
    </div>
  );
};

const AppLoading = ({ name }: { name: string }) => {
  return (
    <InitCanvas>
      Loading <b>{name}</b>...
    </InitCanvas>
  );
};

const AppError = ({ name, error }: { name: string; error: string }) => {
  console.log(error);
  return (
    <InitCanvas>
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

import { ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";
import assertNever from "assert-never";
import { keyBy } from "lodash";
import React, { useMemo, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Graph } from "./components/Graph";
import { Hud } from "./components/Hud";
import { CssBaseline } from "./CssBaseline";
import { ConfigContext } from "./services/config";
import { Dataset, DatasetProvider, useDatasets } from "./services/dataset";
import { UiStateProvider } from "./services/uiState";
import { Config } from "./types/Config";
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

const AppLoading = ({ name }: { name: string }) => {
  return <div>{name}</div>;
};

const AppError = ({ name, error }: { name: string; error: string }) => {
  return null;
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

function App({ ds }: { ds: Dataset[] }) {
  // leave router outside so that we can switch datasets through urls later
  return (
    <Router>
      <DatasetProvider datasets={ds}>
        <AppInit />
      </DatasetProvider>
    </Router>
  );
}

export default App;

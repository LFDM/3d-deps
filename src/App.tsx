import { ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";
import { keyBy } from "lodash";
import React, { useMemo, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Graph } from "./components/Graph";
import { Hud } from "./components/Hud";
import { useQueryParam } from "./hooks/useQueryParam";
import { ConfigContext } from "./services/config";
import { UiStateProvider } from "./services/uiState";
import { Config } from "./types/Config";
import { DependencyNode } from "./types/DependencyAnalyzer";
import { GraphData, TreeNode } from "./types/GraphData";

const Main = styled("main")((p) => ({
  backgroundColor: p.theme.typography.backgroundColor,
  color: p.theme.typography.color,
  width: "100vw",
  height: "100vh",
  overflow: "hidden",

  font: "400 14px Arial",

  h4: {
    marginTop: p.theme.spacing(),
    marginBottom: p.theme.spacing(),
  },

  h5: {
    marginTop: p.theme.spacing(),
    marginBottom: p.theme.spacing(),
  },

  "*": {
    scrollbarWidth: "thin",
    scrollbarColor: `${p.theme.hud.backgroundColor} lightgray`,

    "::-webkit-scrollbar": {
      width: p.theme.spacing(0.5),
      height: p.theme.spacing(0.5),
    },

    "::-webkit-scrollbar-track": {
      background: p.theme.hud.backgroundColor,
      border: `1px solid ${p.theme.hud.backgroundColor}`,
      opacity: p.theme.hud.opacity,
    },
    "::-webkit-scrollbar-thumb": {
      borderRadius: 2,
      background: "lightgray",
    },
    "::-webkit-scrollbar-corner": {
      background: p.theme.hud.backgroundColor,
      opacity: p.theme.hud.opacity,
    },
  },
}));

const depsToGraphData = (
  ds: DependencyNode[],
  opts?: {
    excludeByPath?: RegExp;
  }
): { list: TreeNode[]; byId: { [id: string]: TreeNode } } => {
  const list: TreeNode[] = [];
  const byId: { [id: string]: TreeNode } = {};
  const dsById = keyBy(ds, (d) => d.id);
  const getOrCreateTreeNode = (d: DependencyNode): TreeNode => {
    if (!byId[d.id]) {
      const exclude = !!opts?.excludeByPath?.test(d.path);
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
  excludeByPath?: RegExp
): GraphData => {
  return useMemo(
    () =>
      depsToGraphData(ds, {
        excludeByPath,
      }),
    [ds, excludeByPath]
  );
};

const MainApp = ({ g }: { g: GraphData }) => {
  const [selectedNodeId, setSelectedNodeId] = useQueryParam("node");
  return (
    <Main>
      <Hud
        g={g}
        selectedNodeId={selectedNodeId || null}
        setSelectedNodeId={setSelectedNodeId}
      />
      <Graph g={g} />
    </Main>
  );
};

function App({
  config: originalConfig,
  ds,
}: {
  config: Config;
  ds: DependencyNode[];
}) {
  const [config, setConfig] = useState(originalConfig);
  const g = useGraphData(ds, config.graph.excludeByPath);
  return (
    <Router>
      <ConfigContext.Provider
        value={{
          current: config,
          original: originalConfig,
          onChange: setConfig,
        }}
      >
        <ThemeProvider theme={config.theme}>
          <UiStateProvider>
            <MainApp g={g} />
          </UiStateProvider>
        </ThemeProvider>
      </ConfigContext.Provider>
    </Router>
  );
}

export default App;

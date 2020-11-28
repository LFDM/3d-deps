import { ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";
import { groupBy, keyBy, mapValues } from "lodash";
import { nanoid } from "nanoid";
import React, { useMemo, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Graph } from "./components/Graph";
import { Hud } from "./components/Hud";
import { ConfigContext } from "./hooks/useConfig";
import { useQueryParam } from "./hooks/useQueryParam";
import { Config } from "./types/Config";
import { DependencyNode } from "./types/DependencyAnalyzer";
import { GraphData, IGraphLink, IGraphNode, TreeNode } from "./types/GraphData";

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
): GraphData["data"] => {
  const nodes: IGraphNode[] = [];
  const links: IGraphLink[] = [];
  const dsById = keyBy(ds, (d) => d.id);
  ds.forEach((n) => {
    if (opts?.excludeByPath?.test(n.path)) {
      return;
    }
    const node: IGraphNode = {
      id: n.id,
      label: n.label || n.id,
      path: n.path,
    };
    nodes.push(node);
    n.dependsOn.forEach((v) => {
      const otherN = dsById[v];
      if (!v) {
        console.log(`No node for ${v} in ${n.id} found`);
        return;
      }
      if (opts?.excludeByPath?.test(otherN.path)) {
        return;
      }
      const link: IGraphLink = {
        id: nanoid(),
        source: n.id,
        target: v,
      };
      links.push(link);
    });
  });
  return { nodes, links };
};

const useGraphData = (
  ds: DependencyNode[],
  excludeByPath?: RegExp
): GraphData => {
  return useMemo(() => {
    const depsById = keyBy(ds, (d) => d.id);
    const data = depsToGraphData(ds, { excludeByPath });
    const nodesById = keyBy(data.nodes, (n) => n.id);
    const asTree: {
      [id: string]: TreeNode;
    } = {};
    const getOrCreateTreeNode = (n: IGraphNode) => {
      if (!asTree[n.id]) {
        asTree[n.id] = {
          node: n,
          dependsOn: {
            nodes: depsById[n.id].dependsOn.map((c) => nodesById[c]),
            ids: new Set(depsById[n.id].dependsOn),
          },
          dependedBy: { nodes: [], ids: new Set() },
        };
      }
      return asTree[n.id];
    };
    data.nodes.forEach((n) => {
      const treeNode = getOrCreateTreeNode(n);
      treeNode.dependsOn.nodes.forEach((child) => {
        const childTreeNode = getOrCreateTreeNode(child);
        childTreeNode.dependedBy.nodes.push(n);
        childTreeNode.dependedBy.ids.add(n.id);
      });
    });

    return {
      data,
      asTree,
      linksBySource: mapValues(
        groupBy(data.links, (l) => l.source),
        (v) => groupBy(v, (l) => l.target)
      ),
      linksByTarget: mapValues(
        groupBy(data.links, (l) => l.target),
        (v) => groupBy(v, (l) => l.source)
      ),
      linksById: keyBy(data.links, (l) => l.id),
    };
  }, [ds, excludeByPath]);
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
      <Graph
        g={g}
        selectedNodeId={selectedNodeId || null}
        setSelectedNodeId={setSelectedNodeId}
      />
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
          <MainApp g={g} />
        </ThemeProvider>
      </ConfigContext.Provider>
    </Router>
  );
}

export default App;

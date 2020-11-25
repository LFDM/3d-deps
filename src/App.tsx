import { ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";
import { groupBy, keyBy } from "lodash";
import { nanoid } from "nanoid";
import React, { useMemo, useState } from "react";
import { Graph } from "./components/Graph";
import { Hud } from "./components/Hud";
import { Config } from "./types/Config";
import { DependencyNode } from "./types/DependencyAnalyzer";
import { GraphData, IGraphLink, IGraphNode, TreeNode } from "./types/GraphData";

const Main = styled("main")((p) => ({
  backgroundColor: p.theme.typography.backgroundColor,
  color: p.theme.typography.color,
  width: "100vw",
  height: "100vh",
  overflow: "hidden",

  "*": {
    scrollbarWidth: "thin",
    scrollbarColor: `${p.theme.typography.backgroundColor} lightgray`,

    "::-webkit-scrollbar": {
      width: p.theme.spacing(0.5),
    },

    "::-webkit-scrollbar-track": {
      background: p.theme.typography.backgroundColor,
      border: `1px solid ${p.theme.typography.backgroundColor}`,
    },
    "::-webkit-scrollbar-thumb": {
      borderRadius: 2,
      background: "lightgray",
    },
  },
}));

const depsToGraphData = (ds: DependencyNode[]): GraphData["data"] => {
  const nodes: IGraphNode[] = [];
  const links: IGraphLink[] = [];
  ds.forEach((n) => {
    const node: IGraphNode = {
      id: n.id,
      label: n.label || n.id,
      path: n.path,
    };
    nodes.push(node);
    n.dependsOn.forEach((v) => {
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

const useGraphData = (ds: DependencyNode[]): GraphData => {
  return useMemo(() => {
    const depsById = keyBy(ds, (d) => d.id);
    const data = depsToGraphData(ds);
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
      linksBySource: groupBy(data.links, (l) => l.source),
      linksByTarget: groupBy(data.links, (l) => l.target),
    };
  }, [ds]);
};

function App({ config, ds }: { config: Config; ds: DependencyNode[] }) {
  const [theme, setTheme] = useState(config.theme);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const g = useGraphData(ds);
  return (
    <ThemeProvider theme={theme}>
      <Main>
        <Hud
          g={g}
          onChangeTheme={setTheme}
          selectedNodeId={selectedNodeId}
          setSelectedNodeId={setSelectedNodeId}
        />
        <Graph
          g={g}
          selectedNodeId={selectedNodeId}
          setSelectedNodeId={setSelectedNodeId}
        />
      </Main>
    </ThemeProvider>
  );
}

export default App;

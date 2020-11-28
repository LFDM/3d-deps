import { ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";
import { keyBy, values } from "lodash";
import { nanoid } from "nanoid";
import React, { useMemo, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Graph } from "./components/Graph";
import { Hud } from "./components/Hud";
import { ConfigContext } from "./hooks/useConfig";
import { useQueryParam } from "./hooks/useQueryParam";
import { Config } from "./types/Config";
import { DependencyNode } from "./types/DependencyAnalyzer";
import {
  GraphData,
  IGraphLink,
  IGraphNode,
  TreeNode,
  TreeNodeNew,
} from "./types/GraphData";

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

const filterDeps = (
  ds: DependencyNode[],
  opts?: {
    excludeByPath?: RegExp;
  }
) => {
  const dsById = keyBy(ds, (d) => d.id);
  // try to maintain object integrity if possible
  let res = ds;
  if (opts?.excludeByPath) {
    res = ds.reduce<DependencyNode[]>((m, d) => {
      if (opts?.excludeByPath?.test(d.path)) {
        return m;
      }
      const dependsOn = d.dependsOn.filter((n) => {
        const otherD = dsById[n];
        if (opts?.excludeByPath?.test(otherD.path)) {
          return false;
        }
        return true;
      });

      m.push(
        d.dependsOn.length === dependsOn.length
          ? d
          : {
              ...d,
              dependsOn,
            }
      );
      return m;
    }, []);
  }

  return res;
};

const depsToGraphData = (ds: DependencyNode[]): GraphData["data"] => {
  const nodes: IGraphNode[] = [];
  const links: IGraphLink[] = [];
  const dsById = keyBy(ds, (d) => d.id);
  ds.forEach((n) => {
    const node: IGraphNode = {
      id: n.id,
      label: n.label || n.id,
      path: n.path,
    };
    nodes.push(node);
    n.dependsOn.forEach((v) => {
      const otherN = dsById[v];
      if (!otherN) {
        console.log(`No node for ${v} in ${n.id} found`);
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

const depsToTreeNodes = (
  ds: DependencyNode[],
  opts?: {
    excludeByPath?: RegExp;
  }
): { list: TreeNodeNew[]; byId: { [id: string]: TreeNodeNew } } => {
  const list: TreeNodeNew[] = [];
  const byId: { [id: string]: TreeNodeNew } = {};
  const dsById = keyBy(ds, (d) => d.id);
  const getOrCreateTreeNode = (d: DependencyNode): TreeNodeNew => {
    if (!byId[d.id]) {
      const exclude = !!opts?.excludeByPath?.test(d.path);
      const t: TreeNodeNew = {
        id: d.id,
        label: d.label || d.id,
        path: d.path,
        // initialize empty, so that we can collect the object
        // before we start recursing, preventing issues with circular dependencies
        dependedBy: { nodes: [] },
        dependsOn: { nodes: [] },
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
  return useMemo(() => {
    const filteredDs = filterDeps(ds, {
      excludeByPath,
    });
    const depsById = keyBy(filteredDs, (d) => d.id);
    const data = depsToGraphData(filteredDs);
    const nodesById = keyBy(data.nodes, (n) => n.id);
    const byId: {
      [id: string]: TreeNode;
    } = {};
    const list: TreeNode[] = [];
    const getOrCreateTreeNode = (n: IGraphNode) => {
      if (!byId[n.id]) {
        const nextNode: TreeNode = {
          id: n.id,
          label: n.label,
          path: n.path,
          color: n.color,
          group: n.group,

          node: n,
          dependsOn: {
            nodes: depsById[n.id].dependsOn.map((c) => nodesById[c]),
          },
          dependedBy: { nodes: [] },
          exclude: false,
        };
        byId[n.id] = nextNode;
        list.push(nextNode);
      }
      return byId[n.id];
    };
    data.nodes.forEach((n) => {
      const treeNode = getOrCreateTreeNode(n);
      treeNode.dependsOn.nodes.forEach((child) => {
        const childTreeNode = getOrCreateTreeNode(child);
        childTreeNode.dependedBy.nodes.push(n);
      });
    });

    const graphData: GraphData = {
      data,
      byId: byId,
      list: values(byId),
    };
    return graphData;
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

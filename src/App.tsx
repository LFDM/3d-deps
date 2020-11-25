import { ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";
import { groupBy, keyBy } from "lodash";
import { nanoid } from "nanoid";
import React, { useMemo, useState } from "react";
import { ForceGraph3D } from "react-force-graph";
import { useWindowSize } from "./hooks/useWindowSize";
import { Config, Theme } from "./types/Config";
import { DependencyNode } from "./types/DependencyAnalyzer";
import { GraphData, IGraphLink, IGraphNode } from "./types/GraphData";

const depsToGraphData = (ds: DependencyNode[]): GraphData => {
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

const useGraphData = (ds: DependencyNode[]) => {
  return useMemo(() => {
    const depsById = keyBy(ds, (d) => d.id);
    const graphData = depsToGraphData(ds);
    const nodesById = keyBy(graphData.nodes, (n) => n.id);
    const asTree: {
      [id: string]: {
        node: IGraphNode;
        dependsOn: { nodes: IGraphNode[]; ids: Set<string> };
        dependedBy: { nodes: IGraphNode[]; ids: Set<string> };
      };
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
    graphData.nodes.forEach((n) => {
      const treeNode = getOrCreateTreeNode(n);
      treeNode.dependsOn.nodes.forEach((child) => {
        const childTreeNode = getOrCreateTreeNode(child);
        childTreeNode.dependedBy.nodes.push(n);
        childTreeNode.dependedBy.ids.add(n.id);
      });
    });

    return {
      graphData,
      asTree,
      linksBySource: groupBy(graphData.links, (l) => l.source),
      linksByTarget: groupBy(graphData.links, (l) => l.target),
    };
  }, [ds]);
};

type NodeStyle = Partial<{
  color: string;
  opacity: number;
}>;
type LinkStyle = Partial<{
  color: string;
  particles: number;
}>;

type Styles = {
  nodes: {
    [id: string]: NodeStyle;
  };
  links: {
    [id: string]: LinkStyle;
  };
};

const addNodeStyle = (styles: Styles, nodeId: string, s: NodeStyle) => {
  const v = (styles.nodes[nodeId] = styles.nodes[nodeId] || {});
  styles.nodes[nodeId] = { ...v, ...s };
};

const addLinkStyle = (styles: Styles, linkId: string, s: LinkStyle) => {
  const v = (styles.links[linkId] = styles.links[linkId] || {});
  styles.links[linkId] = { ...v, ...s };
};

const Graph = ({ ds, theme }: { ds: DependencyNode[]; theme: Theme }) => {
  // TODO
  // onSelect:
  // - hightlight node
  // - incoming deps -> 2-3 layers
  // - outgoing deps -> 2-3 layers
  // - all links between them, activate particles
  const dimensions = useWindowSize();
  const g = useGraphData(ds);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const styles = useMemo(() => {
    const ss: Styles = {
      nodes: {},
      links: {},
    };
    const nodeColors = theme.graph.nodes.colors;
    const linkColors = theme.graph.links.colors;
    if (selectedNodeId) {
      addNodeStyle(ss, selectedNodeId, {
        color: nodeColors.selected,
      });
      const treeNode = g.asTree[selectedNodeId];
      treeNode.dependsOn.nodes.forEach((n) => {
        addNodeStyle(ss, n.id, { color: nodeColors.dependent });
      });
      treeNode.dependedBy.nodes.forEach((n) => {
        addNodeStyle(ss, n.id, { color: nodeColors.dependency });
      });

      g.graphData.nodes.forEach((n) => {
        if (!ss.nodes[n.id]?.color) {
          addNodeStyle(ss, n.id, { color: nodeColors.unselected });
          (g.linksBySource[n.id] || []).forEach((l) =>
            addLinkStyle(ss, l.id, { color: linkColors.unselected })
          );
          (g.linksByTarget[n.id] || []).forEach((l) =>
            addLinkStyle(ss, l.id, { color: linkColors.unselected })
          );
        }
      });

      const sourceLinks = g.linksBySource[selectedNodeId] || [];
      sourceLinks.forEach((l) => {
        addLinkStyle(ss, l.id, { particles: 7 });
      });
      const targetLinks = g.linksByTarget[selectedNodeId] || [];
      targetLinks.forEach((l) => {
        addLinkStyle(ss, l.id, { particles: 7 });
      });
    }

    return ss;
  }, [g, selectedNodeId, theme]);

  // might be better to compute style objects for everything
  // - and then just use these vars in the respective functions
  return (
    <ForceGraph3D
      {...dimensions}
      graphData={g.graphData}
      backgroundColor={theme.graph.background.color}
      nodeId="id"
      nodeColor={(node: any) =>
        styles.nodes[node.id]?.color || theme.graph.nodes.colors.standard
      }
      linkDirectionalParticles={(link: any) =>
        styles.links[link.id]?.particles || 0
      }
      linkDirectionalArrowLength={3.5}
      linkDirectionalArrowRelPos={1}
      linkDirectionalArrowColor={(link: any) =>
        styles.links[link.id]?.color || theme.graph.links.colors.standard
      }
      linkColor={(link: any) =>
        styles.links[link.id]?.color || theme.graph.links.colors.standard
      }
      nodeLabel={(node) => (node as IGraphNode).label}
      enableNodeDrag={false}
      onNodeClick={(node) =>
        setSelectedNodeId((s) => (s === node.id! ? null : `${node.id!}`))
      }
    />
  );
};

const Main = styled("main")((p) => ({
  backgroundColor: p.theme.graph.background.color,
}));

function App({ config, ds }: { config: Config; ds: DependencyNode[] }) {
  return (
    <ThemeProvider theme={config.theme}>
      <Main>
        <Graph ds={ds} theme={config.theme} />
      </Main>
    </ThemeProvider>
  );
}

export default App;

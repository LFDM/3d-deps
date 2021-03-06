import { MAX_GRAPH_HIGHLIGHT_DEPTH } from "@3d-deps/core";
import { groupBy, keyBy, mapValues, sortBy } from "lodash";
import { nanoid } from "nanoid";
import React, { useEffect, useMemo, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { Object3D } from "three";
import SpriteText from "three-spritetext";
import tinycolor from "tinycolor2";
import { useWindowSize } from "../../hooks/useWindowSize";
import { useConfig } from "../../services/config";
import { useUiState } from "../../services/uiState";
import {
  GraphData,
  IGraphLink,
  IGraphNode,
  TreeNode,
} from "../../types/GraphData";

const OBJECT = new Object3D();

type NodeStyle = Partial<{
  color: string;
  opacity: number;
  size: number;
  label: boolean;
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

const addNodeStyle = (
  styles: Styles,
  nodeId: string,
  s: NodeStyle | ((prevStyle: NodeStyle) => NodeStyle)
) => {
  const v = (styles.nodes[nodeId] = styles.nodes[nodeId] || {});
  const nextStyle = typeof s === "function" ? s(v) : s;
  styles.nodes[nodeId] = { ...v, ...nextStyle };
};

const addLinkStyle = (
  styles: Styles,
  linkId: string,
  s: LinkStyle | ((prevStyle: LinkStyle) => LinkStyle)
) => {
  const v = (styles.links[linkId] = styles.links[linkId] || {});
  const nextStyle = typeof s === "function" ? s(v) : s;
  styles.links[linkId] = { ...v, ...nextStyle };
};

type Data = {
  ds: {
    nodes: IGraphNode[];
    links: IGraphLink[];
  };

  nodesById: { [id: string]: IGraphNode };
  linksById: { [id: string]: IGraphLink };
  linksBySource: { [sourceId: string]: { [targetId: string]: IGraphLink[] } };
  linksByTarget: { [targetId: string]: { [sourceId: string]: IGraphLink[] } };

  asTree: { [id: string]: TreeNode };
  list: TreeNode[];
};

const traverseDependencies = (
  d: Data,
  current: string,
  mode: "dependsOn" | "dependedBy",
  result: {
    nodes: { [id: string]: number };
    links: { [id: string]: number };
  },
  level: number,
  maxDepth: number
): {
  nodes: { [id: string]: number };
  links: { [id: string]: number };
} => {
  if (level < maxDepth) {
    const treeNode = d.asTree[current];
    treeNode[mode].nodes.forEach((n) => {
      if (n.exclude) {
        return;
      }
      // always use the most direct level!
      if (
        (result.nodes[n.id] === undefined ? Infinity : result.nodes[n.id]) >
        level
      ) {
        result.nodes[n.id] = level;
        const links =
          mode === "dependsOn"
            ? d.linksByTarget[current]?.[n.id] || []
            : d.linksBySource[current]?.[n.id] || [];
        links.forEach((l) => (result.links[l.id] = level));

        traverseDependencies(d, n.id, mode, result, level + 1, maxDepth);
      }
    });
  }
  return result;
};

const useData = (g: GraphData): Data => {
  return useMemo(() => {
    const nodes: IGraphNode[] = [];
    const links: IGraphLink[] = [];

    g.list.forEach((t) => {
      if (t.exclude) {
        return;
      }
      const node: IGraphNode = {
        id: t.id,
        label: t.name,
        path: t.path,
      };
      nodes.push(node);

      t.dependsOn.nodes.forEach((otherT) => {
        if (otherT.exclude) {
          return;
        }
        const link: IGraphLink = {
          id: nanoid(), // this could probably be a more stable id?
          target: t.id,
          source: otherT.id,
        };
        links.push(link);
      });
    });

    return {
      ds: {
        nodes,
        links,
      },
      nodesById: keyBy(nodes, (n) => n.id),
      linksById: keyBy(links, (l) => l.id),
      linksBySource: mapValues(
        groupBy(links, (l) => l.source),
        (v) => groupBy(v, (l) => l.target)
      ),
      linksByTarget: mapValues(
        groupBy(links, (l) => l.target),
        (v) => groupBy(v, (l) => l.source)
      ),

      asTree: g.byId,
      list: g.list,
    };
  }, [g]);
};

const getNodeSize = (t: TreeNode) => {
  const links =
    (t.dependsOn.countDirectWithoutExcluded || 0) +
    (t.dependedBy.countDirectWithoutExcluded || 0);
  return Math.max(0.2, links / 4);
};

export const Graph = () => {
  const [
    {
      graph: { selectedNodeId, data: g, labels },
    },
    { setSelectedNodeId },
  ] = useUiState();

  const data = useData(g);
  const { theme, graph: graphConfig } = useConfig().current;
  const dimensions = useWindowSize();

  const ref = useRef();

  const styles = useMemo(() => {
    const ss: Styles = {
      nodes: {},
      links: {},
    };
    data.list.forEach((t) => {
      addNodeStyle(ss, t.id, {
        size: getNodeSize(t),
      });
    });

    const nodeColors = theme.graph.nodes.colors;
    const linkColors = theme.graph.links.colors;
    const emptyContainer = () => ({ nodes: {}, links: {} });

    if (selectedNodeId && data.nodesById[selectedNodeId]) {
      console.time(`${selectedNodeId}: traverse dependents`);
      const dependsOn = traverseDependencies(
        data,
        selectedNodeId,
        "dependsOn",
        emptyContainer(),
        0,
        Math.min(graphConfig.dependents.maxDepth, MAX_GRAPH_HIGHLIGHT_DEPTH)
      );
      console.timeEnd(`${selectedNodeId}: traverse dependents`);

      console.time(`${selectedNodeId}: traverse dependencies`);
      const dependedBy = traverseDependencies(
        data,
        selectedNodeId,
        "dependedBy",
        emptyContainer(),
        0,
        Math.min(graphConfig.dependencies.maxDepth, MAX_GRAPH_HIGHLIGHT_DEPTH)
      );
      console.timeEnd(`${selectedNodeId}: traverse dependencies`);

      const colorForLevel = (c: tinycolor.Instance, level: number) =>
        c
          .clone()
          // .setAlpha(Math.max(0.3, 1 - level / 2)) // opacity doesn't work - arrowheads don't support it
          .lighten(Math.min(30, level * 12))
          .toRgbString();

      const nodeDependentColor = tinycolor(nodeColors.dependent);
      Object.entries(dependsOn.nodes).forEach(([nodeId, level]) => {
        addNodeStyle(ss, nodeId, {
          color: colorForLevel(nodeDependentColor, level),
          label: level === 0,
        });
      });

      const nodeDepdendencyColor = tinycolor(nodeColors.dependency);
      Object.entries(dependedBy.nodes).forEach(([nodeId, level]) => {
        addNodeStyle(ss, nodeId, {
          color: colorForLevel(nodeDepdendencyColor, level),
          label: level === 0,
        });
      });

      const particlesForLevel = (level: number) =>
        Math.max(1, Math.floor(9 - level * 4));

      const linkDependentColor = tinycolor(linkColors.dependent);
      Object.entries(dependsOn.links).forEach(([linkId, level]) => {
        addLinkStyle(ss, linkId, {
          color: colorForLevel(linkDependentColor, level),
          particles: particlesForLevel(level),
        });
      });

      const linkDepdendencyColor = tinycolor(linkColors.dependency);
      Object.entries(dependedBy.links).forEach(([linkId, level]) => {
        addLinkStyle(ss, linkId, {
          color: colorForLevel(linkDepdendencyColor, level),
          particles: particlesForLevel(level),
        });
      });

      data.ds.nodes.forEach((n) => {
        if (
          dependedBy.nodes[n.id] === undefined &&
          dependsOn.nodes[n.id] === undefined &&
          n.id !== selectedNodeId
        ) {
          addNodeStyle(ss, n.id, {
            color: nodeColors.unselected,
            size: 0.5,
          });
        }
      });
      data.ds.links.forEach((l) => {
        if (
          dependedBy.links[l.id] === undefined &&
          dependsOn.links[l.id] === undefined
        ) {
          addLinkStyle(ss, l.id, { color: linkColors.unselected });
        }
      });

      // color selectedNode last, because circular depdencies might
      // have colored it already.
      addNodeStyle(ss, selectedNodeId, (prev) => {
        return {
          color: nodeColors.selected,
          size: Math.max(prev.size || 0, 5),
          label: true,
        };
      });
      return ss;
    }

    if (selectedNodeId && !data.nodesById[selectedNodeId]) {
      console.warn(
        `Unknown node ${selectedNodeId} encountered - continuing without selection`
      );
    }

    data.list.forEach((t) => {
      const labelKey = t.labels.find((l) => labels[l]?.active);
      if (labelKey) {
        const l = labels[labelKey];
        if (l?.active) {
          addNodeStyle(ss, t.id, {
            color: l.color,
          });
        }
      }
    });

    const topNodes = sortBy(
      data.list,
      (d) =>
        -(d.exclude
          ? -Infinity
          : d.dependedBy.countDirectWithoutExcluded +
            d.dependsOn.countDirectWithoutExcluded)
    ).slice(0, Math.max(15, Math.round(data.list.length / 1000)));

    topNodes.forEach((t) =>
      addNodeStyle(ss, t.id, {
        label: true,
      })
    );

    return ss;
  }, [data, selectedNodeId, theme, graphConfig, labels]);

  useEffect(() => {
    setTimeout(() => {
      const r: any = ref.current;
      r?.cameraPosition({ x: 0 }, { x: -200 });
    }, 0);
  }, []);

  return (
    <ForceGraph3D
      ref={ref}
      controlType="trackball"
      {...dimensions}
      graphData={data.ds}
      backgroundColor={theme.typography.backgroundColor}
      nodeId="id"
      nodeVal={(node: any) => styles.nodes[node.id]?.size || 1}
      nodeRelSize={4}
      nodeColor={(node: any) =>
        styles.nodes[node.id]?.color || theme.graph.nodes.colors.standard
      }
      nodeThreeObjectExtend={true}
      // TODO dependency mismatch for three
      nodeThreeObject={(node: any): any => {
        const s = styles.nodes[node.id];
        if (!s?.label) {
          return OBJECT;
        }
        const size = s.size || 1;
        const sprite = new SpriteText(node.label);
        sprite.material.depthWrite = false; // make sprite background transparent
        sprite.textHeight = 4;
        sprite.color = s.color || "transparent";
        sprite.translateY(Math.min(1.5, size) * 8);
        return sprite;
      }}
      linkResolution={1}
      linkDirectionalParticles={(link: any) =>
        styles.links[link.id]?.particles || 0
      }
      linkColor={(link: any) =>
        styles.links[link.id]?.color || theme.graph.links.colors.standard
      }
      nodeLabel={(node) => (node as IGraphNode).label}
      enableNodeDrag={true}
      onNodeClick={(node) =>
        setSelectedNodeId(selectedNodeId === node.id! ? null : `${node.id!}`)
      }
    />
  );
};

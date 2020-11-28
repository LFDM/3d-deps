import { groupBy, keyBy, mapValues } from "lodash";
import { nanoid } from "nanoid";
import React, { useEffect, useMemo, useRef } from "react";
import { ForceGraph3D } from "react-force-graph";
import tinycolor from "tinycolor2";
import { useWindowSize } from "../../hooks/useWindowSize";
import { useConfig } from "../../services/config";
import {
  GraphData,
  IGraphLink,
  IGraphNode,
  TreeNode,
} from "../../types/GraphData";

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
      // always use the most direct level!
      if ((result.nodes[n.id] || Infinity) > level) {
        result.nodes[n.id] = level;
        const links =
          mode === "dependsOn"
            ? d.linksBySource[current]?.[n.id]
            : d.linksByTarget[current]?.[n.id] || [];
        links.forEach((l) => (result.links[l.id] = level));
      }
      traverseDependencies(d, n.id, mode, result, level + 1, maxDepth);
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
        label: t.label,
        path: t.path,
      };
      nodes.push(node);

      t.dependsOn.nodes.forEach((otherT) => {
        if (otherT.exclude) {
          return;
        }
        const link: IGraphLink = {
          id: nanoid(), // this could probably be a more stable id?
          source: t.id,
          target: otherT.id,
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
    };
  }, [g]);
};

export const Graph = ({
  g,
  selectedNodeId,
  setSelectedNodeId,
}: {
  g: GraphData;
  selectedNodeId: string | null;
  setSelectedNodeId: (v: string | null) => void;
}) => {
  const data = useData(g);
  const { theme, graph: graphConfig } = useConfig().current;
  const dimensions = useWindowSize();

  const ref = useRef();

  const styles = useMemo(() => {
    const ss: Styles = {
      nodes: {},
      links: {},
    };
    const nodeColors = theme.graph.nodes.colors;
    const linkColors = theme.graph.links.colors;
    const emptyContainer = () => ({ nodes: {}, links: {} });

    if (selectedNodeId) {
      if (!data.nodesById[selectedNodeId]) {
        console.warn(
          `Unknown node ${selectedNodeId} encountered - continuing without selection`
        );
        return ss;
      }
      const dependsOn = traverseDependencies(
        data,
        selectedNodeId,
        "dependsOn",
        emptyContainer(),
        0,
        graphConfig.dependents.maxDepth
      );
      const dependedBy = traverseDependencies(
        data,
        selectedNodeId,
        "dependedBy",
        emptyContainer(),
        0,
        graphConfig.dependencies.maxDepth
      );

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
        });
      });

      const nodeDepdendencyColor = tinycolor(nodeColors.dependency);
      Object.entries(dependedBy.nodes).forEach(([nodeId, level]) => {
        addNodeStyle(ss, nodeId, {
          color: colorForLevel(nodeDepdendencyColor, level),
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
          dependsOn.nodes[n.id] === undefined
        ) {
          addNodeStyle(ss, n.id, {
            color: nodeColors.unselected,
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
      addNodeStyle(ss, selectedNodeId, {
        color: nodeColors.selected,
      });

      // const sourceLinks = g.linksBySource[selectedNodeId] || [];
      // sourceLinks.forEach((l) => {
      //   addLinkStyle(ss, l.id, { particles: 7, color: linkColors.dependent });
      // });
      // const targetLinks = g.linksByTarget[selectedNodeId] || [];
      // targetLinks.forEach((l) => {
      //   addLinkStyle(ss, l.id, { particles: 7, color: linkColors.dependency });
      // });
    }

    return ss;
  }, [data, selectedNodeId, theme, graphConfig]);

  // might be better to compute style objects for everything
  // - and then just use these vars in the respective functions

  useEffect(() => {
    setTimeout(() => {
      const r: any = ref.current;
      r.cameraPosition({ x: 0 }, { x: -200 });
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
        setSelectedNodeId(selectedNodeId === node.id! ? null : `${node.id!}`)
      }
    />
  );
};

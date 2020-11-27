import { useTheme } from "@emotion/react";
import React, { useEffect, useMemo, useRef } from "react";
import { ForceGraph3D } from "react-force-graph";
import tinycolor from "tinycolor2";
import { useWindowSize } from "../../hooks/useWindowSize";
import { GraphData, IGraphNode, TreeNode } from "../../types/GraphData";

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

const traverseDependencies = (
  treeNodes: { [id: string]: TreeNode },
  current: string,
  mode: "dependsOn" | "dependedBy",
  result: { [id: string]: number },
  level: number
): { [id: string]: number } => {
  const treeNode = treeNodes[current];
  // pass all first, so that we have the most direct connection in our result, then recurse
  treeNode[mode].nodes.forEach((n) => {
    if (result[n.id] === undefined) {
      result[n.id] = level;
    }
  });
  treeNode[mode].nodes.forEach((n) => {
    traverseDependencies(treeNodes, n.id, mode, result, level + 1);
  });
  return result;
};

const MAX_DEPTH = 1;

export const Graph = ({
  g,
  selectedNodeId,
  setSelectedNodeId,
}: {
  g: GraphData;
  selectedNodeId: string | null;
  setSelectedNodeId: (v: string | null) => void;
}) => {
  // TODO
  // onSelect:
  // - hightlight node
  // - incoming deps -> 2-3 layers
  // - outgoing deps -> 2-3 layers
  // - all links between them, activate particles
  const theme = useTheme();
  const dimensions = useWindowSize();

  const ref = useRef();

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

      const dependsOn = traverseDependencies(
        g.asTree,
        selectedNodeId,
        "dependsOn",
        {},
        0
      );
      const dependedBy = traverseDependencies(
        g.asTree,
        selectedNodeId,
        "dependedBy",
        {},
        0
      );

      const dependentColor = tinycolor(nodeColors.dependent);
      Object.entries(dependsOn).forEach(([nodeId, level]) => {
        if (level < MAX_DEPTH) {
          addNodeStyle(ss, nodeId, {
            color: dependentColor
              .clone()
              .setAlpha(Math.max(0.3, 1 - level / 2))
              .toRgbString(),
          });
        }
      });

      const dependencyColor = tinycolor(nodeColors.dependency);
      Object.entries(dependedBy).forEach(([nodeId, level]) => {
        if (level < MAX_DEPTH) {
          addNodeStyle(ss, nodeId, {
            color: dependencyColor
              .clone()
              .setAlpha(Math.max(0.3, 1 - level / 2))
              .toRgbString(),
          });
        }
      });

      g.data.nodes.forEach((n) => {
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
        addLinkStyle(ss, l.id, { particles: 7, color: linkColors.dependent });
      });
      const targetLinks = g.linksByTarget[selectedNodeId] || [];
      targetLinks.forEach((l) => {
        addLinkStyle(ss, l.id, { particles: 7, color: linkColors.dependency });
      });
    }

    return ss;
  }, [g, selectedNodeId, theme]);

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
      graphData={g.data}
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

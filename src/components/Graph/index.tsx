import React, { useEffect, useMemo, useRef } from "react";
import { ForceGraph3D } from "react-force-graph";
import tinycolor from "tinycolor2";
import { useConfig } from "../../hooks/useConfig";
import { useWindowSize } from "../../hooks/useWindowSize";
import { GraphData, IGraphNode } from "../../types/GraphData";

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
  g: GraphData,
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
    const treeNode = g.asTree[current];
    treeNode[mode].nodes.forEach((n) => {
      // always use the most direct level!
      if ((result.nodes[n.id] || Infinity) > level) {
        result.nodes[n.id] = level;
        const links =
          mode === "dependsOn"
            ? g.linksBySource[current]?.[n.id]
            : g.linksByTarget[current]?.[n.id] || [];
        links.forEach((l) => (result.links[l.id] = level));
      }
      traverseDependencies(g, n.id, mode, result, level + 1, maxDepth);
    });
  }
  return result;
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
  // TODO
  // onSelect:
  // - hightlight node
  // - incoming deps -> 2-3 layers
  // - outgoing deps -> 2-3 layers
  // - all links between them, activate particles
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
      const dependsOn = graphConfig.dependents.active
        ? traverseDependencies(
            g,
            selectedNodeId,
            "dependsOn",
            emptyContainer(),
            0,
            graphConfig.dependents.maxDepth
          )
        : emptyContainer();
      const dependedBy = graphConfig.dependencies.active
        ? traverseDependencies(
            g,
            selectedNodeId,
            "dependedBy",
            emptyContainer(),
            0,
            graphConfig.dependencies.maxDepth
          )
        : emptyContainer();

      const colorForLevel = (c: tinycolor.Instance, level: number) =>
        c
          // don't clone - let's just mutate. It's throwaway in our case anyway. Save some speed...
          // .clone()
          .setAlpha(Math.max(0.3, 1 - level / 2))
          //.lighten(Math.min(80, level * 1.5 * 10))
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

      const linkDependentColor = tinycolor(linkColors.dependent);
      Object.entries(dependsOn.links).forEach(([linkId, level]) => {
        addLinkStyle(ss, linkId, {
          color: colorForLevel(linkDependentColor, level),
        });
      });

      const linkDependencyColor = tinycolor(linkColors.dependency);
      Object.entries(dependedBy.links).forEach(([linkId, level]) => {
        addLinkStyle(ss, linkId, {
          color: colorForLevel(linkDependencyColor, level),
        });
      });

      g.data.nodes.forEach((n) => {
        if (!ss.nodes[n.id]?.color) {
          addNodeStyle(ss, n.id, { color: nodeColors.unselected });
          Object.entries(g.linksBySource[n.id] || {}).forEach(([_, ls]) =>
            ls.forEach((l) =>
              addLinkStyle(ss, l.id, { color: linkColors.unselected })
            )
          );
          Object.entries(g.linksByTarget[n.id] || {}).forEach(([_, ls]) =>
            ls.forEach((l) =>
              addLinkStyle(ss, l.id, { color: linkColors.unselected })
            )
          );
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
  }, [g, selectedNodeId, theme, graphConfig]);

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

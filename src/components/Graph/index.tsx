import { useTheme } from "@emotion/react";
import * as d3 from "d3-force";
import React, { useEffect, useMemo, useRef } from "react";
import { ForceGraph2D } from "react-force-graph";
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
      const treeNode = g.asTree[selectedNodeId];
      treeNode.dependsOn.nodes.forEach((n) => {
        addNodeStyle(ss, n.id, { color: nodeColors.dependent });
      });
      treeNode.dependedBy.nodes.forEach((n) => {
        addNodeStyle(ss, n.id, { color: nodeColors.dependency });
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
      if (r.cameraPosition) {
        r.cameraPosition({ x: 0 }, { x: -200 });
      }
      if (r.d3Force) {
        r.d3Force(
          "collision",
          d3.forceCollide((node) =>
            Math.sqrt(500 / ((node as IGraphNode).path.split("/").length + 1))
          )
        );
      }
    }, 0);
  }, []);

  return (
    <ForceGraph2D
      ref={ref}
      dagMode="td"
      dagLevelDistance={100}
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
      d3VelocityDecay={0.1}
      d3AlphaDecay={0.01}
      d3AlphaMin={0.01}
    />
  );
};

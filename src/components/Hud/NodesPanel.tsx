import { sortBy } from "lodash";
import { useMemo } from "react";
import { GraphData } from "../../types/GraphData";

export const NodesPanel = ({
  g,
  selectedNodeId,
  setSelectedNodeId,
}: {
  g: GraphData;
  selectedNodeId: string | null;
  setSelectedNodeId: (v: string | null) => void;
}) => {
  const treeNodes = useMemo(
    () => sortBy(g.data.nodes, (n) => n.path).map((n) => g.asTree[n.id]),
    [g]
  );
  return (
    <>
      {treeNodes.map((t) => (
        <div key={t.node.id}>{t.node.label}</div>
      ))}
    </>
  );
};

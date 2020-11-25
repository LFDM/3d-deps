import { sortBy } from "lodash";
import React, { useMemo } from "react";
import { GraphData } from "../../types/GraphData";
import { Button } from "../Button";
import { toFileTree } from "../FileTree";

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
  const fileTree = toFileTree(treeNodes);
  console.log(fileTree);
  return (
    <>
      {treeNodes.map((t) => (
        <Button
          variant="none"
          key={t.node.id}
          fullWidth
          onClick={() =>
            setSelectedNodeId(t.node.id === selectedNodeId ? null : t.node.id)
          }
        >
          {t.node.label}
        </Button>
      ))}
    </>
  );
};

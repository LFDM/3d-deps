import { sortBy } from "lodash";
import React, { useMemo, useState } from "react";
import { GraphData } from "../../types/GraphData";
import { FileTreeDirectoryContent, toFileTree } from "../FileTree";

export const NodesPanel = ({
  g,
  selectedNodeId,
  setSelectedNodeId,
}: {
  g: GraphData;
  selectedNodeId: string | null;
  setSelectedNodeId: (v: string | null) => void;
}) => {
  const [openNodes, setOpenNodes] = useState<{ [key: string]: boolean }>({});
  const { rootDir, treeNodes } = useMemo(() => {
    const tn = sortBy(g.data.nodes, (n) => n.path).map((n) => g.asTree[n.id]);
    return { treeNodes: tn, rootDir: toFileTree(tn) };
  }, [g]);

  return (
    <FileTreeDirectoryContent
      dir={rootDir}
      onSelect={(t) => {
        const nodeId = t.node.id;
        return setSelectedNodeId(selectedNodeId === nodeId ? null : nodeId);
      }}
      openNodes={openNodes}
      setOpenNodes={setOpenNodes}
    />
  );
};

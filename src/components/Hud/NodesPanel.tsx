import { sortBy } from "lodash";
import React, { SetStateAction, useLayoutEffect, useMemo } from "react";
import { GraphData } from "../../types/GraphData";
import { FileTreeDirectoryContent, SEPARATOR, toFileTree } from "../FileTree";

export const NodesPanel = ({
  g,
  selectedNodeId,
  setSelectedNodeId,
  openNodes,
  setOpenNodes,
}: {
  g: GraphData;
  selectedNodeId: string | null;
  setSelectedNodeId: (v: string | null) => void;
  openNodes: { [key: string]: boolean };
  setOpenNodes: React.Dispatch<SetStateAction<{ [key: string]: boolean }>>;
}) => {
  const { rootDir } = useMemo(() => {
    return {
      rootDir: toFileTree(sortBy(g.list, (n) => n.path)),
    };
  }, [g]);

  useLayoutEffect(() => {
    if (selectedNodeId) {
      const treeNode = g.byId[selectedNodeId];
      if (!treeNode) {
        return;
      }
      const { path } = treeNode;
      const parts = path.split(SEPARATOR);
      const toOpen: { [key: string]: boolean } = {};
      for (let i = 0; i < parts.length; i++) {
        const key = parts.slice(0, i + 1).join(SEPARATOR);
        toOpen[key] = true;
      }
      setOpenNodes((x) => ({ ...x, ...toOpen }));
    }
  }, [selectedNodeId, g, setOpenNodes]);

  const selectedItemKey = selectedNodeId
    ? g.byId[selectedNodeId]?.path || null
    : null;

  return (
    <div>
      <FileTreeDirectoryContent
        dir={rootDir}
        onSelect={(t) => {
          if (t.exclude) {
            return;
          }
          const nodeId = t.id;
          return setSelectedNodeId(selectedNodeId === nodeId ? null : nodeId);
        }}
        openNodes={openNodes}
        setOpenNodes={setOpenNodes}
        selectedItemKey={selectedItemKey}
      />
    </div>
  );
};

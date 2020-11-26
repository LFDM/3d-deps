import styled from "@emotion/styled";
import { sortBy } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useQueryParam } from "../../hooks/useQueryParam";
import { GraphData } from "../../types/GraphData";
import { FileTreeDirectoryContent, SEPARATOR, toFileTree } from "../FileTree";
import { Input } from "../Input";

const SearchArea = styled("div")((p) => ({
  marginBottom: p.theme.spacing(),
}));

export const NodesPanel = ({
  g,
  selectedNodeId,
  setSelectedNodeId,
}: {
  g: GraphData;
  selectedNodeId: string | null;
  setSelectedNodeId: (v: string | null) => void;
}) => {
  const [q, setQ] = useQueryParam("q", "");

  const [openNodes, setOpenNodes] = useState<{ [key: string]: boolean }>({});
  const { rootDir } = useMemo(() => {
    const tn = sortBy(g.data.nodes, (n) => n.path).map((n) => g.asTree[n.id]);
    return { treeNodes: tn, rootDir: toFileTree(tn) };
  }, [g]);

  useEffect(() => {
    if (selectedNodeId) {
      const treeNode = g.asTree[selectedNodeId];
      if (!treeNode) {
        return;
      }
      const { path } = treeNode.node;
      const parts = path.split(SEPARATOR);
      const toOpen: { [key: string]: boolean } = {};
      for (let i = 0; i < parts.length; i++) {
        const key = parts.slice(0, i + 1).join(SEPARATOR);
        toOpen[key] = true;
      }
      setOpenNodes((x) => ({ ...x, ...toOpen }));
    }
  }, [selectedNodeId, g]);

  const selectedItemKey = selectedNodeId
    ? g.asTree[selectedNodeId]?.node.path || null
    : null;

  return (
    <div>
      <SearchArea>
        <Input
          value={q}
          onChange={(ev) => setQ(ev.target.value)}
          fullWidth={true}
          type="search"
        />
      </SearchArea>
      <FileTreeDirectoryContent
        dir={rootDir}
        onSelect={(t) => {
          const nodeId = t.node.id;
          return setSelectedNodeId(selectedNodeId === nodeId ? null : nodeId);
        }}
        openNodes={openNodes}
        setOpenNodes={setOpenNodes}
        selectedItemKey={selectedItemKey}
      />
    </div>
  );
};

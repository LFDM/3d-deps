import { sortBy } from "lodash";
import React, { useMemo } from "react";
import { GraphData, TreeNode } from "../../types/GraphData";
import { Button } from "../Button";

type FileTreeItemFile<T> = {
  key: string;
  type: "file";
  label: React.ReactNode;
  data: T;
};

type FileTreeItemDir<T> = {
  key: string;
  type: "dir";
  label: React.ReactNode;
  dirs: FileTreeItemDir<T>[];
  files: FileTreeItemFile<T>[];
};

type FileTreeItem<T> = FileTreeItemDir<T> | FileTreeItemFile<T>;

const SEPARATOR = "/";

const toFileTree = (ds: TreeNode[]): FileTreeItemDir<TreeNode> => {
  const items: { [path: string]: FileTreeItemDir<TreeNode> } = {
    [SEPARATOR]: {
      type: "dir",
      key: SEPARATOR,
      label: SEPARATOR,
      dirs: [],
      files: [],
    },
  };
  ds.forEach((d) => {
    const { path } = d.node;
    const parts = path.split(SEPARATOR);
    const file = parts.pop();
    let lastDir: FileTreeItemDir<TreeNode> = items[SEPARATOR];
    for (let i = 0; i < parts.length; i++) {
      const dirPath = parts.slice(0, i + 1).join(SEPARATOR);
      if (!items[dirPath]) {
        items[dirPath] = {
          type: "dir",
          key: dirPath,
          label: parts[i],
          dirs: [],
          files: [],
        };
        const parentDirPath = parts.slice(0, i).join(SEPARATOR) || SEPARATOR;
        items[parentDirPath].dirs.push(items[dirPath]);
      }
      lastDir = items[dirPath];
    }
    lastDir.files.push({
      type: "file",
      key: path,
      label: file,
      data: d,
    });
  });
  return items[SEPARATOR];
};

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

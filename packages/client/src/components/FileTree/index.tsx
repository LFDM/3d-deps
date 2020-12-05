import styled from "@emotion/styled";
import React from "react";
import tinycolor from "tinycolor2";
import { useScrollIntoView } from "../../hooks/useScrollIntoView";
import { TreeNode } from "../../types/GraphData";
import { Button } from "../Button";
import { NodeStats } from "../NodeStats";
import * as Icons from "./icons";

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

export const SEPARATOR = "/";

export const toFileTree = (ds: TreeNode[]): FileTreeItemDir<TreeNode> => {
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
    const { path } = d;
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

const Frame = styled("div")<{ selected: boolean }>`
  position: relative;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow-x: hidden;
  vertical-align: middle;
  fill: ${(p) => p.theme.hud.color};
`;

const Title = styled("span")`
  vertical-align: middle;
`;

const Content = styled("div")`
  margin-left: 0.3em;
  padding: 0px 0px 0px 8px;
  border-left: 1px dashed rgba(255, 255, 255, 0.4);
  overflow: hidden;
`;

const toggle: React.CSSProperties = {
  width: "0.85em",
  height: "0.85em",
  marginRight: 10,
  cursor: "pointer",
  verticalAlign: "middle",
};

const Row = styled("div")<{
  selected?: boolean;
  excluded?: boolean;
  clickable?: boolean;
}>((p) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",

  padding: [p.theme.spacing(0.25), p.theme.spacing(2), p.theme.spacing(0.25), 0]
    .map((x) => `${x}px`)
    .join(" "),
  opacity: p.excluded ? 0.5 : 1,

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(),
  },

  backgroundColor: p.selected ? p.theme.hud.primaryColor : "none",

  ":hover": {
    backgroundColor:
      p.selected || p.excluded || !p.clickable
        ? "none"
        : tinycolor(p.theme.hud.primaryColor).lighten(10).toRgbString(),
  },
}));

const Tree = React.memo(
  ({
    children,
    label,
    isOpen,
    setOpen,
    onClick,
    isSelected,
    rightSlot,
    excluded,
  }: {
    label: React.ReactNode;
    isOpen: boolean;
    setOpen: (nextOpen: boolean) => void;
    children?: React.ReactNode;
    onClick?: () => void;
    isSelected: boolean;
    rightSlot?: React.ReactNode;
    excluded?: boolean;
  }) => {
    const ref = useScrollIntoView<HTMLDivElement>(isSelected);
    const Icon = (Icons as any)[
      `${children ? (isOpen ? "Minus" : "Plus") : "Close"}SquareO`
    ];
    return (
      <Frame ref={ref} selected={isSelected}>
        <Row excluded={excluded} selected={isSelected} clickable={!!onClick}>
          <div>
            <Icon
              style={{ ...toggle, opacity: children ? 1 : 0.3 }}
              onClick={() => setOpen(!isOpen)}
            />
            <Title>
              {onClick && !excluded ? (
                <Button variant="none" onClick={onClick}>
                  {label}
                </Button>
              ) : excluded ? (
                <s>{label}</s>
              ) : (
                label
              )}
            </Title>
          </div>
          <div>{rightSlot}</div>
        </Row>
        {isOpen && <Content>{children}</Content>}
      </Frame>
    );
  }
);

export const FileTreeDirectoryContent = ({
  dir,
  onSelect,
  openNodes,
  setOpenNodes,
  selectedItemKey,
}: {
  dir: FileTreeItemDir<TreeNode>;
  onSelect: (t: TreeNode) => void;

  openNodes: { [key: string]: boolean };
  setOpenNodes: (nextV: { [key: string]: boolean }) => void;

  selectedItemKey: string | null;
}) => {
  return (
    <>
      {dir.dirs.map((d) => (
        <FileTree
          key={d.key}
          item={d}
          onSelect={onSelect}
          openNodes={openNodes}
          setOpenNodes={setOpenNodes}
          selectedItemKey={selectedItemKey}
        />
      ))}
      {dir.files.map((d) => (
        <FileTree
          key={d.key}
          item={d}
          onSelect={onSelect}
          openNodes={openNodes}
          setOpenNodes={setOpenNodes}
          selectedItemKey={selectedItemKey}
        />
      ))}
    </>
  );
};

export const FileTree = ({
  item,
  onSelect,
  openNodes,
  setOpenNodes,
  selectedItemKey,
}: {
  item: FileTreeItem<TreeNode>;
  onSelect: (t: TreeNode) => void;

  openNodes: { [key: string]: boolean };
  setOpenNodes: (nextV: { [key: string]: boolean }) => void;
  selectedItemKey: string | null;
}): JSX.Element => {
  const isOpen = !!openNodes[item.key];
  const setOpen = (open: boolean) =>
    setOpenNodes({
      ...openNodes,
      [item.key]: open,
    });
  if (item.type === "dir") {
    // Mark with strikethrough when all children are excluded
    return (
      <Tree
        label={item.label}
        isOpen={isOpen}
        setOpen={setOpen}
        isSelected={item.key === selectedItemKey}
      >
        <FileTreeDirectoryContent
          dir={item}
          onSelect={onSelect}
          openNodes={openNodes}
          setOpenNodes={setOpenNodes}
          selectedItemKey={selectedItemKey}
        />
      </Tree>
    );
  }
  const d = item.data;
  // excluded nodes show their full count - to get a sense for how many connections
  // are excluded by excluding this node
  // active nodes show their count without them
  return (
    <Tree
      label={item.label}
      onClick={() => onSelect(d)}
      isOpen={isOpen}
      setOpen={setOpen}
      isSelected={item.key === selectedItemKey}
      excluded={d.exclude}
      rightSlot={<NodeStats d={d} />}
    />
  );
};

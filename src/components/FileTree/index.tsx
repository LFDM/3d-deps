import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import React from "react";
import tinycolor from "tinycolor2";
import { useScrollIntoView } from "../../hooks/useScrollIntoView";
import { TreeNode } from "../../types/GraphData";
import { Button } from "../Button";
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
  padding: 4px 0px 0px 0px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow-x: hidden;
  vertical-align: middle;
  color: ${(p) => (p.selected ? p.theme.hud.highlightColor : "inherit")};
  fill: ${(p) => (p.selected ? p.theme.hud.highlightColor : p.theme.hud.color)};
`;

const Title = styled("span")`
  vertical-align: middle;
`;

const Content = styled("div")`
  margin-left: 6px;
  padding: 0px 0px 0px 14px;
  border-left: 1px dashed rgba(255, 255, 255, 0.4);
  overflow: hidden;
`;

const toggle: React.CSSProperties = {
  width: "1em",
  height: "1em",
  marginRight: 10,
  cursor: "pointer",
  verticalAlign: "middle",
};

const Row = styled("div")((p) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(),
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
  }: {
    label: React.ReactNode;
    isOpen: boolean;
    setOpen: (nextOpen: boolean) => void;
    children?: React.ReactNode;
    onClick?: () => void;
    isSelected: boolean;
    rightSlot?: React.ReactNode;
  }) => {
    const ref = useScrollIntoView<HTMLDivElement>(isSelected, {
      behavior: "smooth",
    });
    const Icon = (Icons as any)[
      `${children ? (isOpen ? "Minus" : "Plus") : "Close"}SquareO`
    ];
    return (
      <Frame ref={ref} selected={isSelected}>
        <Row>
          <div>
            <Icon
              style={{ ...toggle, opacity: children ? 1 : 0.3 }}
              onClick={() => setOpen(!isOpen)}
            />
            <Title>
              {onClick ? (
                <Button variant="none" onClick={onClick}>
                  {label}
                </Button>
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

const Stats = styled("div")((p) => ({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gridColumnGap: p.theme.spacing(0.5),
  color: p.theme.hud.color,
}));

const Pill = styled("div")<{ color: string }>((p) => {
  return {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 0,
    backgroundColor: tinycolor(p.color).setAlpha(0.7).toHexString(),
    minWidth: p.theme.spacing(2),
    padding: `0 ${p.theme.spacing(0.25)}px`,
  };
});

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
  const theme = useTheme();
  const isOpen = !!openNodes[item.key];
  const setOpen = (open: boolean) =>
    setOpenNodes({
      ...openNodes,
      [item.key]: open,
    });
  if (item.type === "dir") {
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
  return (
    <Tree
      label={item.label}
      onClick={() => onSelect(item.data)}
      isOpen={isOpen}
      setOpen={setOpen}
      isSelected={item.key === selectedItemKey}
      rightSlot={
        <Stats>
          <Pill color={theme.graph.nodes.colors.dependent}>
            {item.data.dependsOn.nodes.length}
          </Pill>
          <Pill color={theme.graph.nodes.colors.dependency}>
            {item.data.dependedBy.nodes.length}
          </Pill>
        </Stats>
      }
    />
  );
};

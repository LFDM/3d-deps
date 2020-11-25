import styled from "@emotion/styled";
import React, { useState } from "react";
import { animated, useSpring } from "react-spring";
import { TreeNode } from "../../types/GraphData";
import { useMeasure, usePrevious } from "./helpers";
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

const SEPARATOR = "/";

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

const Frame = styled("div")`
  position: relative;
  padding: 4px 0px 0px 0px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow-x: hidden;
  vertical-align: middle;
  color: white;
  fill: white;
`;

const Title = styled("span")`
  vertical-align: middle;
`;

const Content = styled(animated.div)`
  will-change: transform, opacity, height;
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

const Tree = React.memo(
  ({
    children,
    label,
    style,
    defaultOpen = false,
  }: {
    label: React.ReactNode;
    defaultOpen?: boolean;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }) => {
    const [isOpen, setOpen] = useState(defaultOpen);
    const previous = usePrevious(isOpen);
    const [bind, { height: viewHeight }] = useMeasure();
    const { height, opacity, transform } = useSpring({
      from: { height: 0, opacity: 0, transform: "translate3d(20px,0,0)" },
      to: {
        height: isOpen ? viewHeight : 0,
        opacity: isOpen ? 1 : 0,
        transform: `translate3d(${isOpen ? 0 : 20}px,0,0)`,
      },
    }) as { height: number; opacity: number; transform: string };
    const Icon = (Icons as any)[
      `${children ? (isOpen ? "Minus" : "Plus") : "Close"}SquareO`
    ];
    return (
      <Frame>
        <Icon
          style={{ ...toggle, opacity: children ? 1 : 0.3 }}
          onClick={() => setOpen(!isOpen)}
        />
        <Title style={style}>{label}</Title>
        <Content
          style={{
            opacity,
            height: isOpen && previous === isOpen ? "auto" : height,
          }}
        >
          <animated.div style={{ transform }} {...bind} children={children} />
        </Content>
      </Frame>
    );
  }
);

export const FileTreeDirectoryContent = ({
  dir,
}: {
  dir: FileTreeItemDir<TreeNode>;
}) => {
  return (
    <>
      {dir.dirs.map((d) => (
        <FileTree key={d.key} item={d} />
      ))}
      {dir.files.map((d) => (
        <FileTree key={d.key} item={d} />
      ))}
    </>
  );
};

export const FileTree = ({
  item,
}: {
  item: FileTreeItem<TreeNode>;
}): JSX.Element => {
  if (item.type === "dir") {
    return (
      <Tree label={item.label}>
        <FileTreeDirectoryContent dir={item} />
      </Tree>
    );
  }
  return <Tree label={item.label} />;
};

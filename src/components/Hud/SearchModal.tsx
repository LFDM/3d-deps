import styled from "@emotion/styled";
import escapeStringRegexp from "escape-string-regexp";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, Settings } from "react-feather";
import tinycolor from "tinycolor2";
import { toggleShowExcludedNodes, useConfig } from "../../services/config";
import { useUiState } from "../../services/uiState";
import { TreeNode } from "../../types/GraphData";
import { Button } from "../Button";
import { Dialog } from "../Dialog";
import { Input } from "../Input";
import { NodeStats } from "../NodeStats";

const CustomInput = styled(Input)((p) => {
  return {
    fontSize: "1.33rem",
    color: p.theme.hud.color,
    backgroundColor: p.theme.hud.backgroundColor,
    padding: p.theme.spacing(2),
    border: "none",
    outline: "none",

    ":focus": {
      border: "none",
      outline: "none",
    },
  };
});

const BaseListItem = styled("div")((p) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: `${p.theme.spacing(0.5)}px ${p.theme.spacing(2)}px`,

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(),
  },
}));

// make this a grid so that we can do ellipsis
const ListItem = styled(BaseListItem)<{ excluded: boolean; selected: boolean }>(
  (p) => ({
    opacity: p.excluded ? 0.5 : 1,
    cursor: p.excluded ? "default" : "pointer",

    "div:first-of-type": {
      textDecoration: p.excluded ? "line-through" : "none",
    },

    backgroundColor: p.selected ? p.theme.hud.highlightColor : "none",

    ":hover": {
      backgroundColor:
        p.excluded || p.selected
          ? "none"
          : tinycolor(p.theme.hud.highlightColor).lighten(10).toRgbString(),
    },
  })
);

const EmptyListItem = styled(BaseListItem)`
  font-style: italic;
`;

const ListContainer = styled("div")((p) => ({
  borderTop: "1px solid currentcolor",
  padding: `${p.theme.spacing(1)}px 0`,
  overflow: "auto",
  maxHeight: "70vh",
}));

const Item = ({
  n,
  selected,
  onSelect,
  listRef,
}: {
  n: TreeNode;
  selected: boolean;
  onSelect: () => void;
  listRef: React.MutableRefObject<HTMLDivElement | null>;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (selected && listRef.current && ref.current) {
      const o = listRef.current.getBoundingClientRect();
      const i = ref.current.getBoundingClientRect();
      if (
        o.top <= i.top &&
        o.left <= i.left &&
        o.bottom >= i.bottom &&
        o.right >= i.right
      ) {
        // element is fully visible
        return;
      }
      let yDiff = 0;
      if (o.top >= i.top) {
        // need to go up
        yDiff = i.top - o.top;
      }
      if (o.bottom <= i.bottom) {
        // need to go down
        yDiff = i.bottom - o.bottom;
      }
      listRef.current.scrollBy(0, yDiff);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);
  return (
    <ListItem
      ref={ref}
      key={n.id}
      excluded={n.exclude}
      selected={selected}
      role="button"
      onClick={() => {
        if (n.exclude) {
          return;
        }
        onSelect();
      }}
    >
      <div>{n.label}</div>
      <NodeStats d={n} />
    </ListItem>
  );
};

const Body = styled("div")((p) => ({
  border: "1px solid currentcolor",
  backgroundColor: p.theme.hud.backgroundColor,
  borderRadius: 4,
}));

const Controls = styled("div")((p) => ({
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  padding: p.theme.spacing(0.5),

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(),
  },
}));

export const SearchModal = () => {
  const [
    {
      graph: { data: g },
      hud: {
        search: { open: searchOpen },
      },
    },
    { setSearchOpen, setSelectedNodeId },
  ] = useUiState();
  const cfg = useConfig();
  const {
    current: {
      hud: {
        search: { showExcludedNodes },
      },
    },
  } = cfg;
  const [q, setQ] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<TreeNode | null>(null);
  const close = () => {
    setQ("");
    setSearchOpen(false);
  };
  const select = (node: TreeNode) => {
    if (node.exclude) {
      return;
    }
    setSelectedNodeId(node.id);
    close();
  };

  const nodes = useMemo(() => {
    const list = showExcludedNodes ? g.list : g.list.filter((n) => !n.exclude);
    if (!q) {
      return list;
    }
    const regexp = new RegExp(escapeStringRegexp(q), "i");
    return list.filter((t) => regexp.test(t.path));
  }, [q, g, showExcludedNodes]);

  const selectableNodes = useMemo(() => nodes.filter((n) => !n.exclude), [
    nodes,
  ]);

  useEffect(() => {
    setSelected(selectableNodes[0] || null);
  }, [selectableNodes]);

  return (
    <Dialog open={searchOpen} onClose={close} width={700} variant="plain">
      <Controls>
        <Button
          variant="icon"
          onClick={() => toggleShowExcludedNodes(cfg.current, cfg.onChange)}
        >
          {showExcludedNodes ? <Eye size={14} /> : <EyeOff size={14} />}
        </Button>
        <Button variant="icon">
          <Settings size={14} />
        </Button>
      </Controls>
      <Body>
        <CustomInput
          // cannot autofocus - if the search is triggered
          // through a keyboard shortcut, it will be immediately
          // used as input. setTimeout to the rescue
          ref={(el) => setTimeout(() => el && el.focus())}
          onKeyDown={(ev) => {
            if (ev.key === "Enter" && selected) {
              select(selected);
            }
            let sel: TreeNode | undefined;
            const i = selected ? selectableNodes.indexOf(selected) : -1;
            if (ev.key === "ArrowDown" || (ev.altKey && ev.key === "j")) {
              sel = selectableNodes[i + 1] || selectableNodes[0]; // circle around
            }
            if (ev.key === "ArrowUp" || (ev.altKey && ev.key === "k")) {
              sel =
                selectableNodes[i - 1] ||
                selectableNodes[selectableNodes.length - 2];
            }
            sel && setSelected(sel);
          }}
          type="search"
          value={q}
          onChange={(ev) => setQ(ev.target.value)}
          fullWidth
        />
        <ListContainer ref={listRef}>
          {nodes.map((n) => (
            <Item
              key={n.id}
              listRef={listRef}
              n={n}
              selected={n === selected}
              onSelect={() => select(n)}
            />
          ))}
          {!nodes.length && <EmptyListItem>No matches.</EmptyListItem>}
        </ListContainer>
      </Body>
    </Dialog>
  );
};

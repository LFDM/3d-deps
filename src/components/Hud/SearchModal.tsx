import styled from "@emotion/styled";
import escapeStringRegexp from "escape-string-regexp";
import { findLast } from "lodash";
import React, { useEffect, useMemo, useRef, useState } from "react";
import tinycolor from "tinycolor2";
import { isElementInViewport } from "../../hooks/useScrollIntoView";
import { useUiState } from "../../services/uiState";
import { TreeNode } from "../../types/GraphData";
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
  maxHeight: "80vh",
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
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>();
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
    if (!q) {
      return g.list;
    }
    const regexp = new RegExp(escapeStringRegexp(q), "i");
    return g.list.filter((t) => regexp.test(t.path));
  }, [q, g]);

  useEffect(() => {
    const sel = nodes.find((n) => !n.exclude);
    setSelected(sel || null);
  }, [nodes]);

  // TODO scroll selection into view
  useEffect(() => {
    if (selected && ref.current && !isElementInViewport(ref.current)) {
      ref.current.scrollIntoView();
    }
  }, [selected]);

  return (
    <Dialog open={searchOpen} onClose={close} width={700} variant="plain">
      <CustomInput
        onKeyDown={(ev) => {
          if (ev.key === "Enter" && selected) {
            select(selected);
          }
          let sel: TreeNode | undefined;
          const i = selected ? nodes.indexOf(selected) : -1;
          if (ev.key === "ArrowDown") {
            let sel = nodes.slice(i + 1).find((n) => !n.exclude);
            if (!sel) {
              // circle around
              sel = nodes.slice(0, i).find((n) => !n.exclude);
            }
            sel && setSelected(sel);
          }
          if (ev.key === "ArrowUp") {
            if (i >= 0) {
              sel = findLast(nodes.slice(0, i), (n) => !n.exclude);
            }
            if (!sel) {
              sel = findLast(nodes, (n) => !n.exclude);
            }
          }
          sel && setSelected(sel);
        }}
        type="search"
        value={q}
        onChange={(ev) => setQ(ev.target.value)}
        fullWidth
        autoFocus
      />
      <ListContainer>
        {nodes.map((n) => {
          return (
            <ListItem
              ref={(el) => {
                if (n === selected && el) {
                  ref.current = el;
                }
              }}
              key={n.id}
              excluded={n.exclude}
              selected={n === selected}
              role="button"
              onClick={() => {
                if (n.exclude) {
                  return;
                }
                select(n);
              }}
            >
              <div>{n.label}</div>
              <NodeStats d={n} />
            </ListItem>
          );
        })}
        {!nodes.length && <EmptyListItem>No matches.</EmptyListItem>}
      </ListContainer>
    </Dialog>
  );
};

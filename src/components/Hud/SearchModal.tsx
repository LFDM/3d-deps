import styled from "@emotion/styled";
import fuzzysort from "fuzzysort";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, Settings } from "react-feather";
import { toggleShowExcludedNodes, useConfig } from "../../services/config";
import { scrollElementIntoView } from "../../services/scroll";
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

// Maybe do ellipsis inside for ultra long names?
const EmptyListItem = styled(Button)`
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
  label,
}: {
  n: TreeNode;
  selected: boolean;
  onSelect: () => void;
  listRef: React.MutableRefObject<HTMLDivElement | null>;
  label: string; // html!
}) => {
  const ref = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (selected && listRef.current && ref.current) {
      scrollElementIntoView(listRef.current, ref.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);
  return (
    <Button
      key={n.id}
      ref={ref}
      variant="listItem"
      disabled={n.exclude}
      selected={selected}
      onClick={() => {
        if (n.exclude) {
          return;
        }
        onSelect();
      }}
    >
      {n.exclude ? <s>{n.label}</s> : <span>{n.label}</span>}
      <NodeStats d={n} />
    </Button>
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

  const searchableNodes = useMemo(
    () => (showExcludedNodes ? g.list : g.list.filter((n) => !n.exclude)),
    [g, showExcludedNodes]
  );

  const nodesWithHighlights = useMemo(() => {
    if (!q) {
      return searchableNodes.map((node) => ({
        node,
        highlightedLabel: node.path,
      }));
    }
    console.time("search");
    const results = fuzzysort
      .go<TreeNode>(q, searchableNodes, {
        key: "path",
        allowTypo: false,
      })
      .map((r) => ({
        node: r.obj,
        highlightedLabel: fuzzysort.highlight(r, "<b>", "</b>") || r.obj.path,
      }));

    console.timeEnd("search");
    return results;
  }, [q, searchableNodes, showExcludedNodes]);

  const selectableNodes = useMemo(
    () => nodesWithHighlights.filter((n) => !n.node.exclude).map((n) => n.node),
    [nodesWithHighlights]
  );

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
            if (ev.altKey && ev.key === "e") {
              ev.preventDefault(); // this otherwise triggers a browser window
              toggleShowExcludedNodes(cfg.current, cfg.onChange);
              return;
            }
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
          {nodesWithHighlights.map((n) => (
            <Item
              key={n.node.id}
              listRef={listRef}
              n={n.node}
              selected={n.node === selected}
              onSelect={() => select(n.node)}
              label={n.highlightedLabel}
            />
          ))}
          {!nodesWithHighlights.length && (
            <EmptyListItem variant="listItem" disabled={true}>
              No matches.
            </EmptyListItem>
          )}
        </ListContainer>
      </Body>
    </Dialog>
  );
};

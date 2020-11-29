import styled from "@emotion/styled";
import React, { useEffect, useRef } from "react";
import tinycolor from "tinycolor2";
import { scrollElementIntoView } from "../../services/scroll";
import { useUiState } from "../../services/uiState";
import { TreeNode } from "../../types/GraphData";
import { Button } from "../Button";
import { NodeStats } from "../NodeStats";

const Row = styled(Button)<{ selected?: boolean; excluded?: boolean }>((p) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: p.theme.spacing(0.5),
  opacity: p.excluded ? 0.5 : 1,
  cursor: p.excluded ? "default" : "pointer",
  backgroundColor: p.selected ? p.theme.hud.highlightColor : "none",

  "div:first-of-type": {
    textDecoration: p.excluded ? "line-through" : "none",
  },

  ":hover": {
    backgroundColor:
      p.excluded || p.selected
        ? "none"
        : tinycolor(p.theme.hud.highlightColor).lighten(10).toRgbString(),
  },

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(),
  },
}));

const List = styled("div")((p) => ({}));

const Item = React.forwardRef<
  HTMLButtonElement,
  {
    t: TreeNode;
    selected?: boolean;
    onClick: () => void;
  }
>(({ t, selected, onClick }, ref) => {
  return (
    <Row
      ref={ref}
      selected={selected}
      excluded={t.exclude}
      variant="none"
      fullWidth
      onClick={() => {
        !t.exclude && onClick();
      }}
    >
      <div>{t.label}</div>
      <NodeStats d={t} />
    </Row>
  );
});

export const HistoryPanel = ({
  scrollContainer,
}: {
  scrollContainer: HTMLElement | null;
}) => {
  const [
    {
      graph: { data, history, selectedNodeId },
    },
    { toggleSelectedNodeId, selectionHistoryMove },
  ] = useUiState();
  const { future, present, past } = history.getHistory();
  const presentT = present && data.byId[present];
  const selectionRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selectedNodeId && scrollContainer && selectionRef.current) {
      scrollElementIntoView(scrollContainer, selectionRef.current);
    }
  }, [selectedNodeId]);
  return (
    <List>
      {past.map((id, i) => {
        const t = data.byId[id];
        return (
          t && (
            <Item
              key={`${id}-${i}`}
              t={t}
              onClick={() => selectionHistoryMove(-(past.length - i))}
            />
          )
        );
      })}
      {presentT && (
        <Item
          t={presentT}
          selected={true}
          ref={selectionRef}
          onClick={() => toggleSelectedNodeId()}
        />
      )}
      {future.map((id, i) => {
        const t = data.byId[id];
        return (
          t && (
            <Item
              key={`${id}-${i}`}
              t={t}
              onClick={() => selectionHistoryMove(i + 1)}
            />
          )
        );
      })}
      <></>
    </List>
  );
};

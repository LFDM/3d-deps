import styled from "@emotion/styled";
import React, { useEffect, useRef } from "react";
import { scrollElementIntoView } from "../../services/scroll";
import { useUiState } from "../../services/uiState";
import { TreeNode } from "../../types/GraphData";
import { Button } from "../Button";
import { NodeStats } from "../NodeStats";

const List = styled("div")((p) => ({
  paddingBottom: p.theme.spacing(2),
}));

const Item = React.forwardRef<
  HTMLButtonElement,
  {
    t: TreeNode;
    selected?: boolean;
    onClick: () => void;
  }
>(({ t, selected, onClick }, ref) => {
  return (
    <Button
      ref={ref}
      selected={selected}
      disabled={t.exclude}
      variant="listItem"
      fullWidth
      onClick={() => {
        !t.exclude && onClick();
      }}
    >
      {t.exclude ? <s>{t.name}</s> : <span>{t.name}</span>}
      <NodeStats d={t} />
    </Button>
  );
});

const EmptyState = styled("div")((p) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: 200,
  opacity: 0.5,
}));

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
  }, [selectedNodeId, scrollContainer]);
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
          key={presentT.id}
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
      {!present && !future.length && !past.length && (
        <EmptyState>
          <em>No selections recorded yet.</em>
        </EmptyState>
      )}
    </List>
  );
};

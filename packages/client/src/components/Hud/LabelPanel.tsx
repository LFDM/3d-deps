import styled from "@emotion/styled";
import { fromPairs } from "lodash";
import React from "react";
import { useUiState } from "../../services/uiState";
import { Button } from "../Button";
import { SelectableNodeLabelChip } from "./NodeLabelChip";
import {
  SidebarPanelBody,
  SidebarPanelContainer,
  SidebarPanelEmptyState,
  SidebarPanelFooter,
} from "./SidebarPanelLayout";

const ControlsGrid = styled("div")((p) => ({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gridColumnGap: p.theme.spacing(3),
}));

export const LabelPanel = () => {
  const [
    {
      graph: { labels },
    },
    { setLabelsActive },
  ] = useUiState();
  const ls = Object.values(labels);
  return (
    <SidebarPanelContainer>
      <SidebarPanelBody noPadding>
        {ls.length ? (
          <div>
            {ls.map((l) => (
              <SelectableNodeLabelChip
                key={l.key}
                d={l}
                onChange={(active) => setLabelsActive({ [l.key]: active })}
              />
            ))}
          </div>
        ) : (
          <SidebarPanelEmptyState>No labels defined.</SidebarPanelEmptyState>
        )}
      </SidebarPanelBody>
      <SidebarPanelFooter>
        <ControlsGrid>
          <Button
            fullWidth
            onClick={() =>
              setLabelsActive(
                fromPairs(Object.keys(labels).map((k) => [k, true]))
              )
            }
          >
            Enable all
          </Button>
          <Button
            fullWidth
            onClick={() =>
              setLabelsActive(
                fromPairs(Object.keys(labels).map((k) => [k, false]))
              )
            }
          >
            Disable all
          </Button>
        </ControlsGrid>
      </SidebarPanelFooter>
    </SidebarPanelContainer>
  );
};

import styled from "@emotion/styled";
import React from "react";
import { useUiState } from "../../services/uiState";
import { Button } from "../Button";
import { SelectableNodeLabelChip } from "./NodeLabelChip";
import {
  SidebarPanelBody,
  SidebarPanelContainer,
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
    { toggleLabel },
  ] = useUiState();
  return (
    <SidebarPanelContainer>
      <SidebarPanelBody>
        <div>
          {Object.values(labels).map((l) => (
            <SelectableNodeLabelChip
              key={l.key}
              d={l}
              onChange={(active) => toggleLabel(l.key, active)}
            />
          ))}
        </div>
      </SidebarPanelBody>
      <SidebarPanelFooter>
        <ControlsGrid>
          <Button fullWidth>Enable all</Button>
          <Button fullWidth>Disable all</Button>
        </ControlsGrid>
      </SidebarPanelFooter>
    </SidebarPanelContainer>
  );
};

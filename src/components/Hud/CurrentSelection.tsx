import styled from "@emotion/styled";
import React from "react";
import { useUiState } from "../../services/uiState";
import { HudSegment } from "./HudSegment";

const Container = styled(HudSegment)((p) => ({
  position: "absolute",
  width: "100%",
  top: 0,
  left: 0,
  display: "flex",
  justifyContent: "center",
}));

export const CurrentSelection = () => {
  const [
    {
      graph: { data, selectedNodeId },
    },
  ] = useUiState();
  if (!selectedNodeId) {
    return null;
  }
  const node = data.byId[selectedNodeId];
  if (!selectedNodeId) {
    return null;
  }
  return <Container>{node.label}</Container>;
};

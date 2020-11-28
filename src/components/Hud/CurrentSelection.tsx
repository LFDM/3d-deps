import styled from "@emotion/styled";
import React from "react";
import { useUiState } from "../../services/uiState";
import { NodeStats } from "../NodeStats";
import { HudSegment } from "./HudSegment";

const Container = styled(HudSegment)((p) => ({
  position: "absolute",
  width: "100%",
  top: 0,
  left: 0,
  display: "flex",
  justifyContent: "center",

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(),
  },
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
  const d = data.byId[selectedNodeId];
  if (!d) {
    console.log("Node not found", selectedNodeId, data.byId);
    return null;
  }
  return (
    <Container>
      <div>{d.label}</div>
      <NodeStats d={d} />
    </Container>
  );
};

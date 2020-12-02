import styled from "@emotion/styled";
import React from "react";
import { useUiState } from "../../services/uiState";
import { TreeNode } from "../../types/GraphData";
import { NodeStats } from "../NodeStats";
import { HudSegment } from "./HudSegment";

const Container = styled(HudSegment)((p) => ({
  position: "absolute",
  width: "100%",
  top: 0,
  left: 0,
  padding: p.theme.spacing(3),
}));

const Title = styled("div")<{ excluded: boolean }>((p) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "1.33em",
  opacity: p.excluded ? 0.2 : "inherit",

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(),
  },
}));

const DetailsContainer = styled("div")((p) => ({
  paddingTop: p.theme.spacing(3),
  paddingBottom: p.theme.spacing(3),
  paddingRight: p.theme.spacing(3),
}));

const Tbd = styled("div")((p) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: 300,
}));

const Details = ({ d }: { d: TreeNode }) => {
  return (
    <DetailsContainer>
      <Tbd>Details coming soon!</Tbd>
    </DetailsContainer>
  );
};

export const CurrentSelection = () => {
  const [
    {
      graph: { data, selectedNodeId, showDetails },
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
      <Title excluded={d.exclude}>
        <div>{d.exclude ? <s>{d.name}</s> : d.name}</div>
        <NodeStats d={d} />
      </Title>
      {showDetails && <Details d={d} />}
    </Container>
  );
};

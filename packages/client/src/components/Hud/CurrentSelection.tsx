import styled from "@emotion/styled";
import React from "react";
import { useUiState } from "../../services/uiState";
import { TreeNode } from "../../types/GraphData";
import { NodeStats } from "../NodeStats";
import { HudSegment } from "./HudSegment";
import { NodeLabelChip } from "./NodeLabelChip";

const Container = styled(HudSegment)<{ background: boolean }>((p) => ({
  position: "absolute",
  width: "100%",
  top: 0,
  left: 0,
  padding: p.theme.spacing(3),
  backgroundColor: p.background ? p.theme.hud.backgroundColor : "transparent",
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

const DependencyGrid = styled("div")((p) => ({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gridColumnGap: p.theme.spacing(2),
  gridRowGap: p.theme.spacing(1),
}));

const Details = ({ d }: { d: TreeNode }) => {
  return (
    <DetailsContainer>
      <DependencyGrid>
        <div>
          <h4>Depends on</h4>
          {d.dependsOn.nodes.map((n) => {
            return <div>{n.name}</div>;
          })}
        </div>

        <div>
          <h4>Required by</h4>
          {d.dependedBy.nodes.map((n) => {
            return <div>{n.name}</div>;
          })}
        </div>
      </DependencyGrid>
    </DetailsContainer>
  );
};

const LabelContainer = styled("div")((p) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "1rem",

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(),
  },
}));

export const CurrentSelection = () => {
  const [
    {
      graph: { data, selectedNodeId, showDetails, labels },
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
  console.log(d, labels);
  return (
    <Container background={showDetails}>
      <Title excluded={d.exclude}>
        <LabelContainer>
          {d.labels.map(
            (l) => labels[l] && <NodeLabelChip key={l} d={labels[l]} />
          )}
        </LabelContainer>
        <div>{d.exclude ? <s>{d.name}</s> : d.name}</div>
        <NodeStats d={d} />
      </Title>

      {showDetails && <Details d={d} />}
    </Container>
  );
};

import styled from "@emotion/styled";
import React from "react";
import { useUiState } from "../../services/uiState";
import { GraphData, TreeNode } from "../../types/GraphData";
import { Button } from "../Button";
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

const NodeList = ({
  ds,
  selectNode,
}: {
  ds: TreeNode[];
  selectNode: (nextId: string) => void;
}) => {
  return (
    <>
      {ds.map((n) => {
        return (
          <Button
            key={n.id}
            variant="listItem"
            disabled={n.exclude}
            onClick={() => selectNode(n.id)}
          >
            {n.exclude ? <s>{n.name}</s> : n.name}
            <NodeStats d={n} />
          </Button>
        );
      })}
    </>
  );
};

const coverage = (
  d: TreeNode,
  mode: "dependsOn" | "dependedBy"
): { [id: string]: number } => {
  const res: { [id: string]: number } = {};
  const traverse = (n: TreeNode, level: number) => {
    n[mode].nodes.forEach((t) => {
      if (t.exclude) {
        return;
      }
      if ((res[t.id] === undefined ? Infinity : res[t.id]) > level) {
        res[t.id] = level;
        traverse(t, level + 1);
      }
    });
  };
  traverse(d, 0);
  return res;
};

const Details = ({
  d,
  g,
  selectNode,
}: {
  d: TreeNode;
  g: GraphData;
  selectNode: (nextId: string) => void;
}) => {
  const allNodes = g.list.filter((t) => !t.exclude).length;
  const dependsOn = Object.keys(coverage(d, "dependsOn")).length;
  const dependedBy = Object.keys(coverage(d, "dependedBy")).length;

  return (
    <DetailsContainer>
      <div>
        Depends on: {dependsOn}/{allNodes} - {(dependsOn / allNodes) * 100}%
      </div>
      <div>
        Required by: {dependedBy}/{allNodes} - {(dependedBy / allNodes) * 100}%
      </div>
      <DependencyGrid>
        <div>
          <h4>Depends on</h4>
          <NodeList ds={d.dependsOn.nodes} selectNode={selectNode} />
        </div>

        <div>
          <h4>Required by</h4>
          <NodeList ds={d.dependedBy.nodes} selectNode={selectNode} />
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
    { setSelectedNodeId },
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

      {showDetails && <Details d={d} selectNode={setSelectedNodeId} g={data} />}
    </Container>
  );
};

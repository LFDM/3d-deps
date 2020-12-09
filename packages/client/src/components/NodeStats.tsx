import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import tinycolor from "tinycolor2";
import { TreeNode } from "../types/GraphData";

const Container = styled("div")((p) => ({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gridColumnGap: p.theme.spacing(0.5),
  color: p.theme.hud.color,
}));

const Pill = styled("div")<{ color: string }>((p) => {
  return {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 0,
    backgroundColor: tinycolor(p.color).setAlpha(0.7).toHexString(),
    minWidth: p.theme.spacing(2),
    padding: `0 ${p.theme.spacing(0.25)}px`,
  };
});

export const NodeStats = ({ d }: { d: TreeNode }) => {
  const theme = useTheme();
  return (
    <Container>
      <Pill color={theme.graph.nodes.colors.dependent}>
        {d.exclude
          ? d.dependsOn.nodes.length
          : d.dependsOn.countDirectWithoutExcluded}
      </Pill>
      <Pill color={theme.graph.nodes.colors.dependency}>
        {d.exclude
          ? d.dependedBy.nodes.length
          : d.dependedBy.countDirectWithoutExcluded}
      </Pill>
    </Container>
  );
};

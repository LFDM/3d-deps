import styled from "@emotion/styled";
import React, { useState } from "react";
import { Theme } from "../../types/Config";
import { GraphData } from "../../types/GraphData";
import { NodesPanel } from "./NodesPanel";
import { ThemePanel } from "./ThemePanel";

type Props = {
  g: GraphData;
  selectedNodeId: string | null;
  setSelectedNodeId: (v: string | null) => void;
  onChangeTheme: (nextTheme: Theme) => void;
};

const Container = styled("div")`
  background: transparent;
  z-index: 2;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
`;

const Grid = styled("div")((p) => ({
  display: "grid",
  gridTemplateColumns: "1fr 2fr 1fr",
  height: "100%",
}));

const Centered = styled("div")((p) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
}));

const SidebarContainer = styled("div")`
  overflow: auto;
  height: 100%;
  width: 100%;
  padding: ${(p) => p.theme.spacing(2)}px;
  pointer-events: auto;
`;

type TabName = "theme" | "nodes";

const Tab = styled("div")();
const Tabs = styled("div")((p) => ({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gridColumnGap: p.theme.spacing(3),
  paddingBottom: p.theme.spacing(),
  marginBottom: p.theme.spacing(2),
  borderBottom: `1px solid lightgray`,
}));

export const Sidebar = ({ onChangeTheme, ...other }: Props) => {
  const [tab, setTab] = useState<TabName>("nodes");
  return (
    <SidebarContainer>
      <Tabs>
        <button onClick={() => setTab("nodes")}>Nodes</button>
        <button onClick={() => setTab("theme")}>Theme</button>
      </Tabs>
      {tab === "nodes" && (
        <Tab>
          <NodesPanel {...other} />
        </Tab>
      )}
      {tab === "theme" && (
        <Tab>
          <ThemePanel onChangeTheme={onChangeTheme} />
        </Tab>
      )}
    </SidebarContainer>
  );
};

export const Hud = (props: Props) => {
  return (
    <Container>
      <Grid>
        <Sidebar {...props} />
        <Centered></Centered>
        <div></div>
      </Grid>
    </Container>
  );
};

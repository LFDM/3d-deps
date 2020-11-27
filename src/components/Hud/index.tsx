import styled from "@emotion/styled";
import React, { useState } from "react";
import { useQueryParam } from "../../hooks/useQueryParam";
import { Config } from "../../types/Config";
import { GraphData } from "../../types/GraphData";
import { Button } from "../Button";
import { ConfigPanel } from "./ConfigPanel";
import { NodesPanel } from "./NodesPanel";
import { OverlayContextProvider, useOverlayContext } from "./OverlayContext";

type Props = {
  g: GraphData;
  selectedNodeId: string | null;
  setSelectedNodeId: (v: string | null) => void;
  onChangeConfig: (nextConfig: Config) => void;
};

const Container = styled("div")<{ overlayActive: boolean }>`
  background: transparent;
  z-index: 2;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: ${(p) => (p.overlayActive ? "all" : "none")};
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
  color: ${(p) => p.theme.hud.color};
  background-color: ${(p) => p.theme.hud.backgroundColor};
  opacity: ${(p) => p.theme.hud.opacity};

  h4,
  h5 {
    color: ${(p) => p.theme.hud.highlightColor};
  }
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

export const Sidebar = ({ onChangeConfig, ...other }: Props) => {
  const [tab, setTab] = useQueryParam("tab", "nodes");
  const [openNodes, setOpenNodes] = useState<{ [key: string]: boolean }>({});
  return (
    <SidebarContainer>
      <Tabs>
        <Button
          variant={tab === "nodes" ? "outlined" : "standard"}
          onClick={() => setTab("nodes")}
        >
          Nodes
        </Button>
        <Button
          variant={tab === "theme" ? "outlined" : "standard"}
          onClick={() => setTab("theme")}
        >
          Theme
        </Button>
      </Tabs>
      {tab === "nodes" && (
        <Tab>
          <NodesPanel
            {...other}
            openNodes={openNodes}
            setOpenNodes={setOpenNodes}
          />
        </Tab>
      )}
      {tab === "theme" && (
        <Tab>
          <ConfigPanel onChangeConfig={onChangeConfig} />
        </Tab>
      )}
    </SidebarContainer>
  );
};

const Body = (props: Props) => {
  const [active] = useOverlayContext();
  return (
    <Container overlayActive={active}>
      <Grid>
        <Sidebar {...props} />
        <Centered></Centered>
        <div></div>
      </Grid>
    </Container>
  );
};

export const Hud = (props: Props) => {
  return (
    <OverlayContextProvider>
      <Body {...props} />
    </OverlayContextProvider>
  );
};

import styled from "@emotion/styled";
import React, { useState } from "react";
import { useQueryParam } from "../../hooks/useQueryParam";
import { toggleSidebar, useConfig } from "../../services/config";
import { GraphData } from "../../types/GraphData";
import { Button } from "../Button";
import { Hotkeys } from "../Hotkeys";
import { ConfigPanel } from "./ConfigPanel";
import { NodesPanel } from "./NodesPanel";
import { OverlayContextProvider, useOverlayContext } from "./OverlayContext";

type Props = {
  g: GraphData;
  selectedNodeId: string | null;
  setSelectedNodeId: (v: string | null) => void;
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

  h4,
  h5 {
    color: ${(p) => p.theme.hud.highlightColor};
  }
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

const HudSegment = styled("div")`
  overflow: auto;
  padding: ${(p) => p.theme.spacing(2)}px;
  pointer-events: auto;
  color: ${(p) => p.theme.hud.color};
  opacity: ${(p) => p.theme.hud.opacity};
`;

const SidebarContainer = styled(HudSegment)`
  height: 100%;
  width: 100%;
  background-color: ${(p) => p.theme.hud.backgroundColor};
`;

type TabName = "config" | "nodes";

const Tab = styled("div")();
const Tabs = styled("div")((p) => ({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gridColumnGap: p.theme.spacing(3),
  paddingBottom: p.theme.spacing(),
  marginBottom: p.theme.spacing(2),
  borderBottom: `1px solid lightgray`,
}));

export const Sidebar = (props: Props) => {
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
          variant={tab === "config" ? "outlined" : "standard"}
          onClick={() => setTab("config")}
        >
          Config
        </Button>
      </Tabs>
      {tab === "nodes" && (
        <Tab>
          <NodesPanel
            {...props}
            openNodes={openNodes}
            setOpenNodes={setOpenNodes}
          />
        </Tab>
      )}
      {tab === "config" && (
        <Tab>
          <ConfigPanel />
        </Tab>
      )}
    </SidebarContainer>
  );
};

const ControlsContainer = styled("div")((p) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  flexDirection: "column",
}));

const ControlButtonsContainer = styled(HudSegment)((p) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(),
  },
}));

const Controls = () => {
  const cfg = useConfig();
  const sidebarOpen = cfg.current.hud.sidebar.open;
  return (
    <ControlsContainer>
      <div></div>
      <ControlButtonsContainer>
        <Button
          variant={sidebarOpen ? "outlined" : "standard"}
          onClick={() => toggleSidebar(cfg.current, cfg.onChange)}
        >
          Sidebar
        </Button>
      </ControlButtonsContainer>
    </ControlsContainer>
  );
};

const Body = (props: Props) => {
  const [active] = useOverlayContext();
  const cfg = useConfig();
  return (
    <Container overlayActive={active}>
      <Grid>
        {cfg.current.hud.sidebar.open ? <Sidebar {...props} /> : <div />}
        <Centered></Centered>
        <Controls />
      </Grid>
    </Container>
  );
};

export const Hud = (props: Props) => {
  return (
    <OverlayContextProvider>
      <Hotkeys />
      <Body {...props} />
    </OverlayContextProvider>
  );
};

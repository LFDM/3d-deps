import styled from "@emotion/styled";
import React, { useRef, useState } from "react";
import { toggleSidebar, useConfig } from "../../services/config";
import { useUiState } from "../../services/uiState";
import { Button } from "../Button";
import { Hotkeys } from "../Hotkeys";
import { ConfigPanel } from "./ConfigPanel";
import { CurrentSelection } from "./CurrentSelection";
import { DatasetExplorer } from "./DatasetExplorer";
import { HistoryPanel } from "./HistoryPanel";
import { HotkeyInfoModal } from "./HotkeyInfoModal";
import { HudSegment } from "./HudSegment";
import { NodesPanel } from "./NodesPanel";
import { OverlayContextProvider, useOverlayContext } from "./OverlayContext";
import { SearchModal } from "./SearchModal";

const Container = styled("div")<{ overlayActive: boolean }>`
  background: transparent;
  z-index: 2;
  height: 100vh;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: ${(p) => (p.overlayActive ? "all" : "none")};

  h4,
  h5 {
    color: ${(p) => p.theme.hud.primaryColor};
  }
`;

const Grid = styled("div")<{ sidebar: boolean }>((p) => ({
  display: "grid",
  gridTemplateColumns: `${p.sidebar ? "1fr" : "0"} 3.5fr`,
  height: "100%",
}));

const SidebarContainer = styled(HudSegment)<{ open: boolean }>`
  height: 100%;
  background-color: ${(p) => p.theme.hud.backgroundColor};
  ${(p) => !p.open && "padding: 0;"}
`;

const RightContainer = styled("div")`
  position: relative;
`;

const Tab = styled("div")();
const Tabs = styled("div")((p) => ({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gridColumnGap: p.theme.spacing(3),
  padding: p.theme.spacing(2),
  marginBottom: p.theme.spacing(2),
  borderBottom: `1px solid lightgray`,
}));

export const Sidebar = ({ open }: { open: boolean }) => {
  const [
    {
      hud: {
        sidebar: { tab },
      },
      graph: { data: g, selectedNodeId },
    },
    { setSidebarTab: setTab, setSelectedNodeId },
  ] = useUiState();
  const containerRef = useRef<HTMLDivElement>(null);
  const [openNodes, setOpenNodes] = useState<{ [key: string]: boolean }>({});
  return (
    <SidebarContainer open={open} ref={containerRef}>
      <Tabs>
        <Button
          variant={tab === "nodes" ? "outlined" : "standard"}
          onClick={() => setTab("nodes")}
        >
          Nodes
        </Button>
        <Button
          variant={tab === "history" ? "outlined" : "standard"}
          onClick={() => setTab("history")}
        >
          History
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
            g={g}
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
            openNodes={openNodes}
            setOpenNodes={setOpenNodes}
          />
        </Tab>
      )}
      {tab === "history" && (
        <Tab>
          <HistoryPanel scrollContainer={containerRef.current} />
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

const ControlsContainer = styled(HudSegment)((p) => ({
  position: "absolute",
  bottom: 0,
  right: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: p.theme.spacing(2),

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(),
  },
}));

const ControlButton: React.FC<{
  active: boolean;
  onClick: () => void;
}> = ({ active, onClick, children }) => (
  <Button variant={active ? "outlined" : "standard"} onClick={onClick}>
    {children}
  </Button>
);

const Controls = () => {
  const cfg = useConfig();
  const sidebarOpen = cfg.current.hud.sidebar.open;
  const [
    {
      hud: {
        hotkeyInfo: { open: hotkeyInfoOpen },
        search: { open: searchOpen },
      },
      graph: { showDetails },
    },
    { setHotkeyInfoOpen, setSearchOpen, toggleDetails },
  ] = useUiState();
  return (
    <ControlsContainer>
      <ControlButton
        active={sidebarOpen}
        onClick={() => toggleSidebar(cfg.current, cfg.onChange)}
      >
        Sidebar
      </ControlButton>
      <ControlButton active={showDetails} onClick={toggleDetails}>
        Details
      </ControlButton>
      <ControlButton
        active={searchOpen}
        onClick={() => setSearchOpen(!searchOpen)}
      >
        Search
      </ControlButton>
      <ControlButton
        active={hotkeyInfoOpen}
        onClick={() => setHotkeyInfoOpen(!hotkeyInfoOpen)}
      >
        Hotkeys
      </ControlButton>
    </ControlsContainer>
  );
};

const Body = () => {
  const [active] = useOverlayContext();
  const cfg = useConfig();
  return (
    <Container overlayActive={active}>
      <Grid sidebar={cfg.current.hud.sidebar.open}>
        <Sidebar open={cfg.current.hud.sidebar.open} />
        <RightContainer>
          <CurrentSelection />
          <Controls />
          <DatasetExplorer />
        </RightContainer>
      </Grid>
    </Container>
  );
};

export const Hud = () => {
  return (
    <OverlayContextProvider>
      <Hotkeys />
      <HotkeyInfoModal />
      <SearchModal />
      <Body />
    </OverlayContextProvider>
  );
};

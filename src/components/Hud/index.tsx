import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import React, { useState } from "react";
import { Theme } from "../../types/Config";
import { GraphData } from "../../types/GraphData";
import { ColorPicker } from "../ColorPicker";

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
  overflow: hidden;
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

const ThemePanel = ({
  onChangeTheme,
}: {
  onChangeTheme: (nextTheme: Theme) => void;
}) => {
  const theme = useTheme();
  return (
    <>
      <ColorPicker
        label="Color"
        value={theme.typography.color}
        onChange={(nextColor) =>
          onChangeTheme({
            ...theme,
            typography: {
              ...theme.typography,
              color: nextColor,
            },
          })
        }
      />
      <ColorPicker
        label="Bg Color"
        value={theme.typography.backgroundColor}
        onChange={(nextColor) =>
          onChangeTheme({
            ...theme,
            typography: {
              ...theme.typography,
              backgroundColor: nextColor,
            },
          })
        }
      />

      <ColorPicker
        label="Dependency"
        value={theme.graph.nodes.colors.dependency}
        onChange={(nextColor) =>
          onChangeTheme({
            ...theme,
            graph: {
              ...theme.graph,
              nodes: {
                ...theme.graph.nodes,
                colors: {
                  ...theme.graph.nodes.colors,
                  dependency: nextColor,
                },
              },
            },
          })
        }
      />
    </>
  );
};

export const Sidebar = ({
  onChangeTheme,
}: {
  onChangeTheme: (nextTheme: Theme) => void;
}) => {
  const [tab, setTab] = useState<TabName>("nodes");
  return (
    <SidebarContainer>
      <Tabs>
        <button onClick={() => setTab("nodes")}>Nodes</button>
        <button onClick={() => setTab("theme")}>Theme</button>
      </Tabs>
      {tab === "nodes" && <Tab>nodes</Tab>}
      {tab === "theme" && (
        <Tab>
          <ThemePanel onChangeTheme={onChangeTheme} />
        </Tab>
      )}
    </SidebarContainer>
  );
};

export const Hud = ({
  g,
  selectedNodeId,
  setSelectedNodeId,
  onChangeTheme,
}: {
  g: GraphData;
  selectedNodeId: string | null;
  setSelectedNodeId: (v: string | null) => void;
  onChangeTheme: (nextTheme: Theme) => void;
}) => {
  return (
    <Container>
      <Grid>
        <Sidebar onChangeTheme={onChangeTheme} />
        <Centered></Centered>
        <div></div>
      </Grid>
    </Container>
  );
};

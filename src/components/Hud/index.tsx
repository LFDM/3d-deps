import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import React from "react";
import { Theme } from "../../types/Config";
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
  padding: ${(p) => p.theme.spacing(1)}px;
  pointer-events: auto;
`;

export const Sidebar = ({
  n
  onChangeTheme,
}: {
  onChangeTheme: (nextTheme: Theme) => void;
}) => {
  const theme = useTheme();
  return (
    <SidebarContainer>
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
    </SidebarContainer>
  );
};

export const Hud = ({
  onChangeTheme,
}: {
  onChangeTheme: (nextTheme: Theme) => void;
}) => {
  return (
    <Container>
      <Grid>
        <Sidebar onChangeTheme={onChangeTheme} />
        <Centered>WELCOME!</Centered>
        <div></div>
      </Grid>
    </Container>
  );
};

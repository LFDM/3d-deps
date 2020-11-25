import styled from "@emotion/styled";
import { Theme } from "../../types/Config";

const Container = styled("div")`
  background: transparent;
  z-index: 2;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  color: white;
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
`;

export const Sidebar = ({
  onChangeTheme,
}: {
  onChangeTheme: (nextTheme: Theme) => void;
}) => {
  return <SidebarContainer>Theme</SidebarContainer>;
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

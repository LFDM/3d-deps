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

export const Hud = ({}: { onChangeTheme: (nextTheme: Theme) => void }) => {
  return (
    <Container>
      <Grid>
        <div></div>
        <Centered>WELCOME!</Centered>
        <div></div>
      </Grid>
    </Container>
  );
};

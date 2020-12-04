import styled from "@emotion/styled";

export const HudContainer = styled("div")<{ overlayActive: boolean }>`
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

import styled from "@emotion/styled";

export const HudSegment = styled("div")`
  box-sizing: border-box;
  overflow: auto;
  pointer-events: auto;
  color: ${(p) => p.theme.hud.color};
  opacity: ${(p) => p.theme.hud.opacity};
`;

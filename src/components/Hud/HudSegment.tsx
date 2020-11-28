import styled from "@emotion/styled";

export const HudSegment = styled("div")`
  overflow: auto;
  padding: ${(p) => p.theme.spacing(2)}px;
  pointer-events: auto;
  color: ${(p) => p.theme.hud.color};
  opacity: ${(p) => p.theme.hud.opacity};
`;

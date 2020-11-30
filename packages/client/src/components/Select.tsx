import styled from "@emotion/styled";

export const Select = styled("select")((p) => ({
  color: p.theme.hud.color,
  backgroundColor: "transparent",
  border: "none",
  font: p.theme.typography.font,

  option: {
    font: p.theme.typography.font,
    color: p.theme.hud.color,
    backgroundColor: p.theme.hud.backgroundColor,
  },
}));

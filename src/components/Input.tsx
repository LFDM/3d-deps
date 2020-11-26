import styled from "@emotion/styled";

export const Input = styled("input")<{ fullWidth?: boolean }>((p) => ({
  color: p.theme.hud.backgroundColor,
  backgroundColor: p.theme.hud.color,
  ...(p.fullWidth && {
    width: "100%",
  }),
}));

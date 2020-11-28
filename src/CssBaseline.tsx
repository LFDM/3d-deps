import styled from "@emotion/styled";

export const CssBaseline = styled("div")((p) => ({
  font: p.theme.typography.font,

  h4: {
    marginTop: p.theme.spacing(),
    marginBottom: p.theme.spacing(),
  },

  h5: {
    marginTop: p.theme.spacing(),
    marginBottom: p.theme.spacing(),
  },

  "*": {
    scrollbarWidth: "thin",
    scrollbarColor: `${p.theme.hud.backgroundColor} lightgray`,

    "::-webkit-scrollbar": {
      width: p.theme.spacing(0.5),
      height: p.theme.spacing(0.5),
    },

    "::-webkit-scrollbar-track": {
      background: p.theme.hud.backgroundColor,
      border: `1px solid ${p.theme.hud.backgroundColor}`,
      opacity: p.theme.hud.opacity,
    },
    "::-webkit-scrollbar-thumb": {
      borderRadius: 2,
      background: "lightgray",
    },
    "::-webkit-scrollbar-corner": {
      background: p.theme.hud.backgroundColor,
      opacity: p.theme.hud.opacity,
    },
  },
}));

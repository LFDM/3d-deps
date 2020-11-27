import styled from "@emotion/styled";

export const ConfigRow = styled("div")((p) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(2),
  },
}));

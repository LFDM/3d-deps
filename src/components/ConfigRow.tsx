import styled from "@emotion/styled";

export const ConfigRow = styled("div")<{ dense?: boolean }>((p) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(p.dense ? 0.5 : 2),
  },
}));

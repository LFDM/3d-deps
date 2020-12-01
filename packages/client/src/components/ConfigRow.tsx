import styled from "@emotion/styled";

export const ConfigRow = styled("div")<{ dense?: boolean; padding?: boolean }>(
  (p) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: p.padding
      ? p.theme.spacing(0.5) + 2 /* a button's border width */
      : 0,

    "> :not(:first-child)": {
      marginLeft: p.theme.spacing(p.dense ? 0.5 : 2),
    },
  })
);

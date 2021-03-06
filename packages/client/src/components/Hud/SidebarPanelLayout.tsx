import styled from "@emotion/styled";

export const SidebarPanelContainer = styled("div")`
  display: grid;
  grid-template-rows: 1fr min-content;
  grid-row-gap: ${(p) => p.theme.spacing()}px;
  height: 100%;
  grid-template-areas:
    "body"
    "footer";
`;

export const SidebarPanelBody = styled("div")<{ noPadding?: boolean }>`
  overflow: auto;
  padding: 0 ${(p) => p.theme.spacing(p.noPadding ? 0 : 2)}px;
  grid-area: "body";

  > :not(:first-child) {
    margin-top: ${(p) => p.theme.spacing(4)}px;
  }
`;

export const SidebarPanelFooter = styled("footer")`
  grid-area: footer;
  padding: ${(p) => p.theme.spacing(2)}px;
  border-top: 1px dashed currentcolor;
`;

export const SidebarPanelEmptyState = styled("div")((p) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: 200,
  opacity: 0.5,
}));

import styled from "@emotion/styled";
import { Helmet } from "./Helmet";

const InitCanvasContainer = styled("div")((p) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  font: p.theme.typography.font,
  height: "100vh",
  width: "100vw",
  backgroundColor: p.theme.typography.backgroundColor,
  color: p.theme.typography.color,

  a: {
    backgroundColor: p.theme.typography.backgroundColor,
    color: p.theme.typography.color,
    textDecoration: "none",
  },
}));

export const InitCanvas: React.FC<{ title?: string }> = ({
  title,
  children,
}) => {
  return (
    <InitCanvasContainer>
      <Helmet title={title} />
      <div>{children}</div>
    </InitCanvasContainer>
  );
};

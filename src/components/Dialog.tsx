import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { useMemo } from "react";
import ReactModal from "react-modal";
import tinycolor from "tinycolor2";
import { CssBaseline } from "../CssBaseline";

ReactModal.setAppElement("#root");

export const DialogTitle = styled("h3")`
  margin-top: 0;
`;

export const Dialog: React.FC<{
  open: boolean;
  onClose: () => void;
  width?: string | number;
  center?: boolean;
  overflow?: React.CSSProperties["overflow"];
  variant?: "standard" | "plain";
}> = ({
  open,
  onClose,
  width,
  center,
  overflow,
  children,
  variant = "standard",
}) => {
  const theme = useTheme();
  const style = useMemo(() => {
    const s: ReactModal.Styles = {
      overlay: {
        zIndex: 10,
        backgroundColor: tinycolor(theme.typography.backgroundColor)
          .setAlpha(0.7)
          .toRgbString(),
      },
      content: {
        padding: variant === "plain" ? 0 : theme.spacing(3),
        top: center ? "50%" : theme.spacing(10),
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: center ? "translate(-50%, -50%)" : "translate(-50%, 0)",
        backgroundColor: theme.hud.backgroundColor,
        border: variant === "plain" ? "none" : "1px solid currentcolor",
        color: theme.hud.color,
        width: width || "auto",
        font: theme.typography.color,
        overflow: overflow || "auto",
        opacity: theme.hud.opacity,
      },
    };
    return s;
  }, [theme, width, center, overflow, variant]);
  return (
    <ReactModal style={style} isOpen={open} onRequestClose={onClose}>
      <CssBaseline>{children}</CssBaseline>
    </ReactModal>
  );
};

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

const DialogBody = styled(CssBaseline)((p) => ({}));

export const DialogActions = styled("div")((p) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: p.theme.spacing(2),

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(),
  },
}));

export const DialogActionsLeftSection = styled("div")((p) => ({
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(),
  },
}));

export const DialogActionsRightSection = styled("div")((p) => ({
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(),
  },
}));

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
        display: "flex",
        justifyContent: "center",
        alignItems: center ? "center" : "flex-start",
      },
      content: {
        position: "relative",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        padding: variant === "plain" ? 0 : theme.spacing(3),
        marginTop: center ? 0 : theme.spacing(8),
        backgroundColor:
          variant === "plain" ? "transparent" : theme.hud.backgroundColor,
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
      <DialogBody>{children}</DialogBody>
    </ReactModal>
  );
};

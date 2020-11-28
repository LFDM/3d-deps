import styled from "@emotion/styled";
import React from "react";

export type ButtonVariant =
  | "outlined"
  | "contained"
  | "standard"
  | "none"
  | "icon";

export type ButtonProps = {
  disabled?: boolean;
  onClick?: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

const StyledButton = styled("button")<{
  variant: ButtonVariant;
  fullWidth?: boolean;
}>((p) => {
  return {
    borderWidth: 2,
    padding: p.theme.spacing(0.5),
    backgroundColor: "transparent",
    color: "inherit",
    borderStyle: "solid",
    cursor: "pointer",
    borderColor: "transparent",
    font: "inherit",

    ":focus": {
      outline: `1px dotted ${p.theme.hud.highlightColor}`,
    },

    ...(p.variant === "outlined" && {
      borderColor: "currentcolor",
    }),

    ...(p.variant === "none" && {
      borderWidth: 0,
      padding: 0,
      textAlign: "inherit",
    }),
    ...(p.variant === "icon" && {
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      textAlign: "center",
    }),
    ...(p.fullWidth && {
      width: "100%",
    }),
  };
});

export const Button: React.FC<ButtonProps> = (props) => {
  return (
    <StyledButton
      type="button"
      {...props}
      variant={props.variant || "standard"}
    />
  );
};

import styled from "@emotion/styled";
import React from "react";
import tinycolor from "tinycolor2";

export type ButtonVariant =
  | "outlined"
  | "contained"
  | "standard"
  | "none"
  | "icon"
  | "listItem";

export type ButtonProps = {
  disabled?: boolean;
  onClick?: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  variant?: ButtonVariant;
  selected?: boolean; // for list items
  fullWidth?: boolean;
  children?: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onKeyDown?: (ev: React.KeyboardEvent<HTMLButtonElement>) => void;
};

const StyledButton = styled("button")<{
  variant: ButtonVariant;
  fullWidth?: boolean;
  selected?: boolean;
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
      outline: `1px dotted ${p.theme.hud.primaryColor}`,
    },

    ":disabled": {
      opacity: 0.5,
      cursor: "default",
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
    ...(p.variant === "listItem" && {
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: `${p.theme.spacing(0.5)}px ${p.theme.spacing(2)}px`,
      backgroundColor: p.selected ? p.theme.hud.primaryColor : "transparent",

      ":hover": {
        backgroundColor: p.selected
          ? "none"
          : tinycolor(p.theme.hud.primaryColor).lighten(10).toRgbString(),
      },
      ":disabled:hover": {
        backgroundColor: "transparent",
      },

      "> :not(:first-child)": {
        marginLeft: p.theme.spacing(),
      },
    }),
    ...(p.fullWidth && {
      width: "100%",
    }),
  };
});

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return (
      <StyledButton
        ref={ref}
        type="button"
        {...props}
        variant={props.variant || "standard"}
      />
    );
  }
);

import styled from "@emotion/styled";
import React from "react";

export type ButtonVariant = "outlined" | "contained" | "standard" | "none";

export type ButtonProps = {
  disabled?: boolean;
  onClick: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  variant?: ButtonVariant;
};

const StyledButton = styled("button")<{ variant: ButtonVariant }>((p) => {
  return {
    "&&": {
      borderWidth: 2,
      padding: p.theme.spacing(0.5),
      ...(p.variant === "outlined" && {
        borderColor: p.theme.typography.color,
      }),

      ...(p.variant === "none" && {
        borderWidth: 0,
        padding: 0,
      }),
    },
  };
});

export const Button: React.FC<ButtonProps> = (props) => {
  return <StyledButton {...props} variant={props.variant || "standard"} />;
};

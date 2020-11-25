import styled from "@emotion/styled";
import React from "react";

export type ButtonVariant = "outlined" | "contained" | "standard" | "none";

export type ButtonProps = {
  disabled?: boolean;
  onClick: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  variant?: ButtonVariant;
};

const StyledButton = styled("button")<{ variant: ButtonVariant }>((p) => {
  if (p.variant === "outlined") {
    return {
      "&&": {
        borderColor: p.theme.typography.color,
        borderWidth: 2,
        padding: p.theme.spacing(0.5),
      },
    };
  }
  if (p.variant === "contained") {
    return {
      "&&": {
        borderWidth: 2,
        padding: p.theme.spacing(0.5),
      },
    };
  }
  if (p.variant === "standard") {
    return {
      "&&": {
        borderWidth: 2,
        padding: p.theme.spacing(0.5),
      },
    };
  }
  return {};
});

export const Button: React.FC<ButtonProps> = (props) => {
  return <StyledButton {...props} variant={props.variant || "standard"} />;
};

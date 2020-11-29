import styled from "@emotion/styled";
import React, { useRef } from "react";

export const StyledInput = styled("input")<{ fullWidth?: boolean }>((p) => ({
  color: p.theme.hud.backgroundColor,
  backgroundColor: p.theme.hud.color,
  ...(p.fullWidth && {
    width: "100%",
  }),
  boxSizing: "border-box",
  font: p.theme.typography.font,
}));

export const Input = React.forwardRef<
  HTMLInputElement,
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > & { blurOnEscape?: boolean; fullWidth?: boolean }
>(({ onKeyDown, blurOnEscape, ...p }, theirRef) => {
  const ref = useRef<HTMLInputElement | null>();
  const oKD = blurOnEscape
    ? (ev: React.KeyboardEvent<HTMLInputElement>) => {
        ev.key === "Escape" && ref.current?.blur();
        onKeyDown && onKeyDown(ev);
      }
    : onKeyDown;
  return (
    <StyledInput
      {...p}
      ref={(r) => {
        ref.current = r;
        if (theirRef) {
          if (typeof theirRef === "function") {
            theirRef(r);
          } else {
            theirRef.current = r;
          }
        }
      }}
      onKeyDown={oKD}
    />
  );
});

const SliderContainer = styled("div")((p) => ({
  display: "flex",
  alignItems: "center",

  "> :not(:last-child)": {
    marginRight: p.theme.spacing(0.5),
  },
}));
export const InputSliderWithValue = (
  p: Omit<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    "type"
  >
) => {
  return (
    <SliderContainer>
      <div>{p.value}</div>
      <input type="range" {...p} />
    </SliderContainer>
  );
};

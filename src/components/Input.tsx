import styled from "@emotion/styled";

export const Input = styled("input")<{ fullWidth?: boolean }>((p) => ({
  color: p.theme.hud.backgroundColor,
  backgroundColor: p.theme.hud.color,
  ...(p.fullWidth && {
    width: "100%",
  }),
  boxSizing: "border-box",
  fontSize: 14,
}));

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

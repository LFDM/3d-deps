import styled from "@emotion/styled";
import { useState } from "react";
import { ChromePicker } from "react-color";

const Container = styled("div")((p) => ({
  position: "relative",
  cursor: "pointer",
}));

const Row = styled("div")((p) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(2),
  },
}));

const ColorName = styled("div")((p) => ({
  display: "flex",
  alignItems: "center",

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(),
  },
}));

const Swatch = styled("div")<{ value: string }>((p) => ({
  width: p.theme.spacing(2),
  height: p.theme.spacing(2),
  backgroundColor: p.value,
}));

const PickerContainer = styled("div")((p) => ({
  position: "absolute",
  top: "100%",
  right: 0,
  zIndex: 5,
}));

export const ColorPicker = ({
  value,
  onChange,
  label,
}: {
  label: React.ReactNode;
  value: string;
  onChange: (nextValue: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Container role="button" onClick={() => setOpen(true)}>
        <Row>
          <label>{label}</label>
          <ColorName>
            <Swatch value={value} />
            <div>{value}</div>
          </ColorName>
        </Row>
        {open && (
          <PickerContainer>
            <ChromePicker
              color={value}
              onChangeComplete={(nextColor) => {
                onChange(nextColor.hex);
                setOpen(false);
              }}
            />
          </PickerContainer>
        )}
      </Container>
    </>
  );
};

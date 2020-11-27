import styled from "@emotion/styled";
import { useRef } from "react";
import { ChromePicker } from "react-color";
import { RefreshCcw } from "react-feather";
import { useOnClickOutside } from "../hooks/useOnClickOutside";
import { Button } from "./Button";
import { ConfigRow } from "./ConfigRow";
import { usePopupState } from "./Hud/OverlayContext";

const Container = styled(Button)((p) => ({
  position: "relative",
  display: "block",
  width: "100%",
}));

const ColorName = styled("div")((p) => ({
  display: "flex",
  alignItems: "center",

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(),
  },
}));

const ColorValue = styled("div")`
  font-family: monospace;
`;

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
  defaultValue,
  onChange,
  label,
}: {
  label: React.ReactNode;
  value: string;
  defaultValue: string;
  onChange: (nextValue: string) => void;
}) => {
  const [open, setOpen] = usePopupState(false);
  const ref = useRef(null);
  useOnClickOutside(ref, () => setOpen(false));
  return (
    <>
      <Container variant="standard" onClick={() => setOpen(true)}>
        <ConfigRow>
          <label>{label}</label>
          <ColorName>
            {value !== defaultValue && (
              <Button
                variant="icon"
                onClick={(ev) => {
                  ev.stopPropagation();
                  onChange(defaultValue);
                }}
              >
                <RefreshCcw size={12} />
              </Button>
            )}
            <Swatch value={value} />
            <ColorValue>{value}</ColorValue>
          </ColorName>
        </ConfigRow>
        {open && (
          <PickerContainer ref={ref}>
            <ChromePicker
              color={value}
              onChange={(nextColor) => {
                onChange(nextColor.hex);
              }}
            />
          </PickerContainer>
        )}
      </Container>
    </>
  );
};

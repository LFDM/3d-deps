import styled from "@emotion/styled";
import tinycolor from "tinycolor2";
import { NodeLabel } from "../../services/uiState";

const LABEL_DARKENING_AMOUNT = 50;

const Chip = styled("div")<{ color: string; active: boolean }>((p) => ({
  color: tinycolor(p.color).darken(LABEL_DARKENING_AMOUNT).toRgbString(),
  backgroundColor: p.color,
  padding: p.theme.spacing(0.5),
  borderRadius: p.theme.spacing(0.25),
  opacity: p.active ? 1 : 0.75,
}));

export const NodeLabelChip = ({ d }: { d: NodeLabel }) => {
  return (
    <Chip color={d.color} active={d.active}>
      {d.key}
    </Chip>
  );
};

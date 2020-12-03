import styled from "@emotion/styled";
import { Check, Minus } from "react-feather";
import tinycolor from "tinycolor2";
import { NodeLabel } from "../../services/uiState";
import { Button } from "../Button";

const LABEL_DARKENING_AMOUNT = 50;

const Chip = styled("div")<{ color: string; active: boolean }>((p) => ({
  color: tinycolor(p.color).darken(LABEL_DARKENING_AMOUNT).toRgbString(),
  backgroundColor: p.color,
  padding: p.theme.spacing(0.5),
  borderRadius: p.theme.spacing(0.25),
  opacity: p.active ? 1 : 0.4,
  textDecoration: p.active ? "inherit" : "line-through",
}));

export const NodeLabelChip = ({ d }: { d: NodeLabel }) => {
  return (
    <Chip color={d.color} active={d.active}>
      {d.key}
    </Chip>
  );
};

const InnerChip = styled(Button)((p) => ({
  display: "flex",
  alignItems: "center",
  padding: p.theme.spacing(0.5),

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(),
  },
}));

export const SelectableNodeLabelChip = ({
  d,
  onChange,
}: {
  d: NodeLabel;
  onChange: (nextActive: boolean) => void;
}) => {
  return (
    <Chip color={d.color} active={d.active}>
      <InnerChip variant="none" onClick={() => onChange(!d.active)} fullWidth>
        {d.active ? <Check size={14} /> : <Minus size={14} />}
        <div>{d.key}</div>
      </InnerChip>
    </Chip>
  );
};

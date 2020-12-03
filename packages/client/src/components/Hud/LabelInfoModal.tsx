import styled from "@emotion/styled";
import React from "react";
import { useUiState } from "../../services/uiState";
import { Dialog, DialogTitle } from "../Dialog";
import { SelectableNodeLabelChip } from "./NodeLabelChip";

const Grid = styled("div")((p) => ({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gridColumnGap: p.theme.spacing(4),
  gridRowGap: p.theme.spacing(1),
}));

// const HotkeyValues = styled("div")`
//   text-align: right;
// `;

// const HotkeyValue = styled("span")`
//   font-family: monospace;
// `;

// const HotkeyRow = ({ h }: { h: KeyMapDisplayOptions }) => {
//   return (
//     <>
//       <div>{h.name}</div>
//       <HotkeyValues>
//         {h.sequences.map((s, i) => (
//           <React.Fragment key={i}>
//             {i !== 0 && <span> or </span>}
//             <HotkeyValue>{s.sequence}</HotkeyValue>
//           </React.Fragment>
//         ))}
//       </HotkeyValues>
//     </>
//   );
// };

export const LabelInfoModal = () => {
  const [
    {
      hud: {
        labelInfo: { open: labelInfoOpen },
      },
      graph: { labels },
    },
    { setLabelInfoOpen, toggleLabel },
  ] = useUiState();
  const close = () => setLabelInfoOpen(false);
  return (
    <Dialog open={labelInfoOpen} onClose={close} center>
      <DialogTitle>Labels</DialogTitle>
      <Grid>
        {Object.values(labels).map((l) => (
          <SelectableNodeLabelChip
            d={l}
            onChange={(active) => toggleLabel(l.key, active)}
          />
        ))}
      </Grid>
    </Dialog>
  );
};

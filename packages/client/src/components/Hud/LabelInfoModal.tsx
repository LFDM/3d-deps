import React from "react";
import { useUiState } from "../../services/uiState";
import { Dialog, DialogTitle } from "../Dialog";

// const HotkeyGrid = styled("div")((p) => ({
//   display: "grid",
//   gridTemplateColumns: "1fr max-content",
//   gridColumnGap: p.theme.spacing(4),
//   gridRowGap: p.theme.spacing(1),
// }));

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
      graph: {},
    },
    { setLabelInfoOpen },
  ] = useUiState();
  const close = () => setLabelInfoOpen(false);
  return (
    <Dialog open={labelInfoOpen} onClose={close} center>
      <DialogTitle>Labels</DialogTitle>
    </Dialog>
  );
};

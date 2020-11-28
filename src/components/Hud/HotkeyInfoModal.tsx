import styled from "@emotion/styled/types/base";
import React from "react";
import { getApplicationKeyMap, KeyMapDisplayOptions } from "react-hotkeys";
import { useUiState } from "../../services/uiState";
import { Dialog, DialogTitle } from "../Dialog";

const HotkeyGrid = styled("div")((p) => ({
  display: "grid",
  gridTemplateColumns: "1fr max-content",
  gridColumnGap: p.theme.spacing(4),
  gridRowGap: p.theme.spacing(1),
}));

const HotkeyValues = styled("div")`
  text-align: right;
`;

const HotkeyValue = styled("span")`
  font-family: monospace;
`;

const HotkeyRow = ({ h }: { h: KeyMapDisplayOptions }) => {
  return (
    <>
      <div>{h.name}</div>
      <HotkeyValues>
        {h.sequences.map((s, i) => (
          <React.Fragment key={i}>
            {i !== 0 && <span> or </span>}
            <HotkeyValue>{s.sequence}</HotkeyValue>
          </React.Fragment>
        ))}
      </HotkeyValues>
    </>
  );
};

export const HotkeyInfoModal = () => {
  const [
    {
      hud: {
        hotkeyInfo: { open: hotkeyInfoOpen },
      },
    },
    { setHotkeyInfoOpen },
  ] = useUiState();
  const close = () => setHotkeyInfoOpen(false);
  const hotkeys = getApplicationKeyMap();
  return (
    <Dialog open={hotkeyInfoOpen} onClose={close} center>
      <DialogTitle>Hotkeys</DialogTitle>

      <HotkeyGrid>
        {Object.entries(hotkeys).map(([id, h]) => (
          <HotkeyRow key={id} h={h} />
        ))}
      </HotkeyGrid>
    </Dialog>
  );
};

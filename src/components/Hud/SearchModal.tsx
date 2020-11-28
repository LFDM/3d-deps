import styled from "@emotion/styled";
import React, { useState } from "react";
import { useUiState } from "../../services/uiState";
import { Dialog } from "../Dialog";
import { Input } from "../Input";

const CustomInput = styled(Input)((p) => {
  return {
    fontSize: "1.33rem",
    color: p.theme.hud.color,
    backgroundColor: p.theme.hud.backgroundColor,
    padding: p.theme.spacing(2),
    border: "none",

    ":focus": {
      border: "none",
    },
  };
});

export const SearchModal = () => {
  const [
    {
      graph: { data: g },
      hud: {
        search: { open: searchOpen },
      },
    },
    { setSearchOpen, setSelectedNodeId },
  ] = useUiState();
  const [q, setQ] = useState("");
  const close = () => {
    setQ("");
    setSearchOpen(false);
  };
  return (
    <Dialog open={searchOpen} onClose={close} width={700} variant="plain">
      <CustomInput
        type="search"
        value={q}
        onChange={(ev) => setQ(ev.target.value)}
        fullWidth
        autoFocus
      />
    </Dialog>
  );
};

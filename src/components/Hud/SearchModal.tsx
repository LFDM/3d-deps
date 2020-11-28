import React from "react";
import { useUiState } from "../../services/uiState";
import { Dialog, DialogTitle } from "../Dialog";

export const SearchModal = () => {
  const [
    {
      hud: {
        search: { open: searchOpen },
      },
    },
    { setSearchOpen },
  ] = useUiState();
  const close = () => setSearchOpen(false);
  return (
    <Dialog open={searchOpen} onClose={close}>
      <DialogTitle>Search</DialogTitle>
    </Dialog>
  );
};

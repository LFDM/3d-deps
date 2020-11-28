import React from "react";
import { useUiState } from "../../services/uiState";
import { Autocomplete } from "../Autocompete";
import { Dialog, DialogTitle } from "../Dialog";

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
  const close = () => setSearchOpen(false);
  return (
    <Dialog open={searchOpen} onClose={close} width={700} overflow="visible">
      <DialogTitle>Search</DialogTitle>

      <Autocomplete
        items={g.list}
        renderItem={(t) => (t.exclude ? <s>{t.path}</s> : t.path)}
        itemToKey={(t) => t.id}
        filterItems={(ts, v) => {
          const re = new RegExp(v, "i");
          return ts.filter((t) => re.test(t.path));
        }}
        onSelect={(t) => {
          if (t.exclude) {
            return;
          }
          setSelectedNodeId(t.id);
          close();
        }}
        fullWidth
        autoFocus
      />
    </Dialog>
  );
};

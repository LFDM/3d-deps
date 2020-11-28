import styled from "@emotion/styled";
import escapeStringRegexp from "escape-string-regexp";
import React, { useMemo, useState } from "react";
import { useUiState } from "../../services/uiState";
import { Dialog } from "../Dialog";
import { Input } from "../Input";
import { NodeStats } from "../NodeStats";

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

// make this a grid so that we can do ellipsis
const ListItem = styled("div")((p) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: p.theme.spacing(0.5),

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(),
  },
}));

const ListContainer = styled("div")((p) => ({
  borderTop: "1px solid currentcolor",
  padding: p.theme.spacing(2),
  overflow: "auto",
  maxHeight: "80vh",

  "> :first-child": {
    marginTop: p.theme.spacing(0.5),
  },
  "> :last-child": {
    marginTop: p.theme.spacing(0.5),
  },
}));

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

  const nodes = useMemo(() => {
    if (!q) {
      return g.list;
    }
    const regexp = new RegExp(escapeStringRegexp(q), "i");
    return g.list.filter((t) => regexp.test(t.path));
  }, [q, g]);
  return (
    <Dialog open={searchOpen} onClose={close} width={700} variant="plain">
      <CustomInput
        type="search"
        value={q}
        onChange={(ev) => setQ(ev.target.value)}
        fullWidth
        autoFocus
      />
      <ListContainer>
        {nodes.map((n) => (
          <ListItem key={n.id}>
            <div>{n.label}</div>
            <NodeStats d={n} />
          </ListItem>
        ))}
      </ListContainer>
    </Dialog>
  );
};

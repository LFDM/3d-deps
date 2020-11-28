import styled from "@emotion/styled";
import escapeStringRegexp from "escape-string-regexp";
import React, { useMemo, useState } from "react";
import tinycolor from "tinycolor2";
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
    outline: "none",

    ":focus": {
      border: "none",
      outline: "none",
    },
  };
});

const BaseListItem = styled("div")((p) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: `${p.theme.spacing(0.5)}px ${p.theme.spacing(2)}px`,

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(),
  },
}));

// make this a grid so that we can do ellipsis
const ListItem = styled(BaseListItem)<{ excluded: boolean }>((p) => ({
  opacity: p.excluded ? 0.5 : 1,
  cursor: p.excluded ? "default" : "pointer",

  "div:first-of-type": {
    textDecoration: p.excluded ? "line-through" : "none",
  },

  ":hover": {
    backgroundColor: p.excluded
      ? "none"
      : tinycolor(p.theme.hud.highlightColor).lighten(10).toRgbString(),
  },
}));

const EmptyListItem = styled(BaseListItem)`
  font-style: italic;
`;

const ListContainer = styled("div")((p) => ({
  borderTop: "1px solid currentcolor",
  padding: `${p.theme.spacing(1)}px 0`,
  overflow: "auto",
  maxHeight: "80vh",
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
        {nodes.map((n) => {
          return (
            <ListItem
              key={n.id}
              excluded={n.exclude}
              role="button"
              onClick={() => {
                if (n.exclude) {
                  return;
                }
                setSelectedNodeId(n.id);
                close();
              }}
            >
              <div>{n.label}</div>
              <NodeStats d={n} />
            </ListItem>
          );
        })}
        {!nodes.length && <EmptyListItem>No matches.</EmptyListItem>}
      </ListContainer>
    </Dialog>
  );
};

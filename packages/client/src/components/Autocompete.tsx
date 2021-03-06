import styled from "@emotion/styled";
import React, { useState } from "react";
import { Button } from "./Button";
import { usePopupState } from "./Hud/OverlayContext";
import { Input } from "./Input";

const Container = styled("div")`
  position: relative;
`;

const Menu = styled("div")`
  color: ${(p) => p.theme.hud.backgroundColor};
  background-color: ${(p) => p.theme.hud.color};
  position: absolute;
  top: 100%;
  left: 0;
  padding: 2px;
  z-index: 5;
  min-width: 100%;
  max-height: 75vh;
  overflow: auto;
  box-sizing: border-box;
  border: 2px solid ${(p) => p.theme.hud.color};
`;

export const Autocomplete = <T extends any>({
  items,
  itemToKey,
  renderItem,
  filterItems,
  onSelect,
  fullWidth,
  autoFocus,
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  itemToKey: (item: T) => string;
  filterItems: (vs: T[], v: string) => T[];
  onSelect: (nextValue: T) => void;
  fullWidth?: boolean;
  autoFocus?: boolean;
}) => {
  const [v, setV] = useState("");
  const [open, setOpen] = usePopupState(false);

  const filteredItems = open && v ? filterItems(items, v) : [];

  return (
    <Container
      onFocus={() => setOpen(true)}
      onBlur={() => setTimeout(() => setOpen(false), 100)}
    >
      <Input
        fullWidth={fullWidth}
        value={v}
        onChange={(ev) => setV(ev.target.value)}
        type="search"
        autoFocus={autoFocus}
      />
      {open && v && (
        <Menu>
          {filteredItems.map((item) => (
            <Button
              fullWidth
              variant="none"
              onClick={() => {
                onSelect(item);
                setV("");
              }}
              key={itemToKey(item)}
            >
              {renderItem(item)}
            </Button>
          ))}
          {!filteredItems.length && (
            <div style={{ textAlign: "center" }}>
              <i>No match</i>
            </div>
          )}
        </Menu>
      )}
    </Container>
  );
};

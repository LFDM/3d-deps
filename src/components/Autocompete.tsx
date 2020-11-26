import styled from "@emotion/styled";
import { useState } from "react";
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
`;

export const Autocomplete = <T extends any>({
  items,
  itemToKey,
  renderItem,
  filterItems,
  fullWidth,
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  itemToKey: (item: T) => string;
  filterItems: (vs: T[], v: string) => T[];
  onSelect: (nextValue: T) => void;
  fullWidth?: boolean;
}) => {
  const [v, setV] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <Container onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
      <Input
        fullWidth={fullWidth}
        value={v}
        onChange={(ev) => setV(ev.target.value)}
        type="search"
      />
      {open && v && (
        <Menu>
          {filterItems(items, v).map((item) => (
            <div key={itemToKey(item)}>{renderItem(item)}</div>
          ))}
        </Menu>
      )}
    </Container>
  );
};

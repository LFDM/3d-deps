import React from "react";
import { useUiState } from "../../services/uiState";
import { SelectableNodeLabelChip } from "./NodeLabelChip";

export const LabelPanel = () => {
  const [
    {
      graph: { labels },
    },
    { toggleLabel },
  ] = useUiState();
  return (
    <>
      <>
        {Object.values(labels).map((l) => (
          <SelectableNodeLabelChip
            key={l.key}
            d={l}
            onChange={(active) => toggleLabel(l.key, active)}
          />
        ))}
      </>
    </>
  );
};

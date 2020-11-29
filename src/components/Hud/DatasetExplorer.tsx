import styled from "@emotion/styled";
import React from "react";
import { useDatasets } from "../../services/dataset";
import { Select } from "../Select";
import { HudSegment } from "./HudSegment";

const Container = styled(HudSegment)((p) => ({
  position: "absolute",
  top: 0,
  right: 0,
  padding: p.theme.spacing(2),
}));

export const DatasetExplorer = () => {
  const { current, datasets, selectDataset } = useDatasets();
  if (datasets.length < 2) {
    return null;
  }
  return (
    <Container>
      <Select
        value={current.name}
        onChange={(ev) => {
          const dataset = datasets.find((x) => x.name === ev.target.value);
          dataset && selectDataset(dataset);
        }}
      >
        {datasets.map((d) => (
          <option key={d.name} value={d.name}>
            {d.name}
          </option>
        ))}
      </Select>
    </Container>
  );
};

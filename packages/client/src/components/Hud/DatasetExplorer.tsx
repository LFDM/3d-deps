import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import React from "react";
import { Maximize } from "react-feather";
import { Link } from "react-router-dom";
import { useDatasets } from "../../services/dataset";
import { Button } from "../Button";
import { Select } from "../Select";
import { HudSegment } from "./HudSegment";

const Container = styled(HudSegment)((p) => ({
  position: "absolute",
  top: 0,
  right: 0,
  padding: p.theme.spacing(2),

  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(),
  },
}));

export const DatasetExplorer = () => {
  const { current, datasets, selectDataset } = useDatasets();
  const t = useTheme();
  if (datasets.length < 2) {
    return null;
  }
  return (
    <Container>
      <Link to="/browser" title="Open browser">
        <Button variant="icon">
          <Maximize size={16} color={t.hud.color} />
        </Button>
      </Link>
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

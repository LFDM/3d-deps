import { Dataset } from "@3d-deps/core";
import styled from "@emotion/styled";
import { sortBy } from "lodash";
import React from "react";
import { Link } from "react-router-dom";
import { InitCanvas } from "../../components/InitCanvas";
import { useDatasets } from "../../services/dataset";

const Grid = styled("div")((p) => ({
  display: "grid",
  // base on media query
  gridTemplateColumns: "repeat(3, 1fr)",
  gridColumnGap: p.theme.spacing(6),
  gridRowGap: p.theme.spacing(6),
}));

const Centered = styled("div")((p) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: p.theme.spacing(3),
}));

const DatasetContainer = styled("div")((p) => ({
  padding: p.theme.spacing(3),
  border: "1px solid currentcolor",
  borderRadius: p.theme.spacing(0.25),
  h3: {
    marginTop: 0,
  },
}));

const Title = styled("h3")((p) => ({
  display: "flex",
  alignItems: "center",

  "> :not(:first-child)": {
    marginLeft: p.theme.spacing(2),
  },

  img: {
    height: p.theme.spacing(4),
  },
}));

const DatasetR = ({ d }: { d: Dataset }) => {
  return (
    <Link to={`/?dataset=${encodeURIComponent(d.name)}`}>
      <DatasetContainer>
        <Title>
          {d.icon && <img src={d.icon} />}
          <div>{d.name}</div>
        </Title>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae,
          praesentium unde maiores beatae ducimus
        </p>
      </DatasetContainer>
    </Link>
  );
};

export const PageBrowser = () => {
  const { datasets } = useDatasets();

  return (
    <InitCanvas>
      <Centered>
        <Grid>
          {sortBy(datasets, (d) => d.name).map((d) => (
            <DatasetR key={d.name} d={d} />
          ))}
        </Grid>
      </Centered>
    </InitCanvas>
  );
};

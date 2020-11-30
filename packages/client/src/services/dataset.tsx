import { Config } from "@3d-deps/config";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { usePromise } from "../hooks/usePromise";
import { useQueryParam } from "../hooks/useQueryParam";
import { DependencyNode } from "../types/DependencyAnalyzer";

export type Dataset = {
  name: string;
  fetch: () => Promise<{
    config: Config;
    data: DependencyNode[];
  }>;
};

type LoadingState = {
  state: "LOADING";
  name: string;
};

type ErrorState = {
  name: string;
  state: "ERROR";
  err: any;
};

type ReadyState = {
  name: string;
  state: "READY";
  config: Config;
  data: DependencyNode[];
};

type State = LoadingState | ErrorState | ReadyState;

const DATASET_CACHE: {
  [key: string]: {
    config: Config;
    data: DependencyNode[];
  };
} = {};

const useResolveDataset = (dataset: Dataset) => {
  return usePromise(
    async () =>
      (DATASET_CACHE[dataset.name] =
        DATASET_CACHE[dataset.name] || (await dataset.fetch())),
    [dataset]
  );
};

export const Datasets = React.createContext<{
  datasets: Dataset[];
  current: State;
  selectDataset: (nextDataset: Dataset) => void;
}>({
  datasets: [],
  current: {
    name: "...",
    state: "LOADING",
  },
  selectDataset: () => undefined,
});

export const DatasetProvider: React.FC<{ datasets: Dataset[] }> = ({
  datasets,
  children,
}) => {
  const [query, setQuery] = useQueryParam("dataset", "");
  const dataset =
    datasets.find((d) => encodeURIComponent(d.name) === query) || datasets[0];
  const selectDataset = useCallback(
    (d: Dataset) => setQuery(encodeURIComponent(d.name)),
    [setQuery]
  );
  const [state, setState] = useState<State>({
    name: dataset.name,
    state: "LOADING",
  });
  const [d, loading, error] = useResolveDataset(dataset);

  useEffect(() => {
    setState(() => {
      if (loading) {
        return { name: dataset.name, state: "LOADING" };
      }
      if (error) {
        return {
          name: dataset.name,
          state: "ERROR",
          err: error.message || "UNKNOWN",
        };
      }
      if (d) {
        return {
          name: dataset.name,
          state: "READY",
          config: d.config,
          data: d.data,
        };
      }
      return { name: dataset.name, state: "ERROR", err: "UNKNOWN" };
    });
  }, [d, loading, error, dataset]);

  return (
    <Datasets.Provider value={{ current: state, datasets, selectDataset }}>
      {children}
    </Datasets.Provider>
  );
};

export const useDatasets = () => useContext(Datasets);

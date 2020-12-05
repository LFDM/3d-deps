import { Config, Dataset, DependencyAnalyzerResult } from "@3d-deps/core";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { usePromise } from "../hooks/usePromise";
import { useQueryParam } from "../hooks/useQueryParam";

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
  data: DependencyAnalyzerResult;
};

type State = LoadingState | ErrorState | ReadyState;

const DATASET_CACHE: {
  [key: string]: {
    config: Config;
    data: DependencyAnalyzerResult;
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

const DatasetsContext = React.createContext<{
  datasets: Dataset[];
}>({
  datasets: [],
});

const CurrentDatasetContext = React.createContext<{
  current: State;
  selectDataset: (nextDataset: Dataset) => void;
}>({
  current: {
    name: "...",
    state: "LOADING",
  },
  selectDataset: () => undefined,
});

export const DatasetProvider: React.FC = ({ children }) => {
  const { datasets } = useDatasets();
  const [query, setQuery] = useQueryParam("dataset", "");
  const dataset =
    datasets.find((d) => d.name === decodeURIComponent(query)) || datasets[0];
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
    <CurrentDatasetContext.Provider value={{ current: state, selectDataset }}>
      {children}
    </CurrentDatasetContext.Provider>
  );
};

export const DatasetsProvider: React.FC<{ datasets: Dataset[] }> = ({
  datasets,
  children,
}) => {
  return (
    <DatasetsContext.Provider value={{ datasets }}>
      {children}
    </DatasetsContext.Provider>
  );
};

export const useDatasets = () => useContext(DatasetsContext);
export const useDataset = () => useContext(CurrentDatasetContext);

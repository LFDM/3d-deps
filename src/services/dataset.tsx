import React, { useContext, useEffect, useState } from "react";
import { usePromise } from "../hooks/usePromise";
import { Config } from "../types/Config";
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
  const [dataset, selectDataset] = useState<Dataset>(datasets[0]);
  const [state, setState] = useState<State>({
    name: dataset.name,
    state: "LOADING",
  });
  const [d, loading, error] = usePromise(dataset.fetch, [dataset]);

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

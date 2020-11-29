import { Config } from "@testing-library/react";
import React, { useEffect, useState } from "react";
import { usePromise } from "../hooks/usePromise";
import { DependencyNode } from "../types/DependencyAnalyzer";

export type Dataset = {
  name: string;
  fetch: () => Promise<{
    config: Config;
    data: DependencyNode[];
  }>;
};

type LoadingState = {
  name: string;
  loading: true;
};

type ErrorState = {
  name: string;
  loading: false;
  err: string;
};

type ReadyState = {
  name: string;
  loading: false;
  err: null;
  config: Config;
  data: DependencyNode[];
};

type State = LoadingState | ErrorState | ReadyState;

export const DatasetsContext = React.createContext<{
  datasets: Dataset[];
  current: State;
  selectDataset: (nextDataset: Dataset) => void;
}>({
  datasets: [],
  current: {
    name: "...",
    loading: true,
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
    loading: true,
  });
  const [d, loading, error] = usePromise(dataset.fetch, [dataset]);

  useEffect(() => {
    setState(() => {
      if (loading) {
        return { name: dataset.name, loading: true };
      }
      if (error) {
        return {
          name: dataset.name,
          loading: false,
          err: error.message || "ERROR",
        };
      }
      if (d) {
        return {
          name: dataset.name,
          loading: false,
          err: null,
          config: d.config,
          data: d.data,
        };
      }
      return { name: dataset.name, loading: false, err: "ERROR" };
    });
  }, [d, loading, error, dataset]);

  return (
    <DatasetsContext.Provider
      value={{ current: state, datasets, selectDataset }}
    >
      {children}
    </DatasetsContext.Provider>
  );
};

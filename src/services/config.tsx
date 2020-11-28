import React, { useContext } from "react";
import { CONFIG, Config } from "../types/Config";

export const ConfigContext = React.createContext<{
  current: Config;
  original: Config;
  onChange: (nextConfig: Config) => void;
}>({
  current: CONFIG,
  original: CONFIG,
  onChange: () => undefined,
});

export const useConfig = () => useContext(ConfigContext);

export const toggleSidebar = (
  current: Config,
  onChange: (nextConfig: Config) => void,
  nextState: boolean = !current.hud.sidebar.open
) => {
  onChange({
    ...current,
    hud: {
      ...current.hud,
      sidebar: {
        ...current.hud.sidebar,
        open: nextState,
      },
    },
  });
};

const setGraphDependenciesMaxDepth = (
  current: Config,
  onChange: (nextConfig: Config) => void,
  nextState: number
) => {
  return onChange({
    ...current,
    graph: {
      ...current.graph,
      dependencies: {
        ...current.graph.dependencies,
        maxDepth: Math.max(0, Math.min(10, nextState)),
      },
    },
  });
};

export const incrementGraphDependenciesMaxDepth = (
  current: Config,
  onChange: (nextConfig: Config) => void,
  increment: number
) =>
  setGraphDependenciesMaxDepth(
    current,
    onChange,
    current.graph.dependencies.maxDepth + increment
  );

const setGraphDependentsMaxDepth = (
  current: Config,
  onChange: (nextConfig: Config) => void,
  nextState: number
) => {
  return onChange({
    ...current,
    graph: {
      ...current.graph,
      dependents: {
        ...current.graph.dependents,
        maxDepth: Math.max(0, Math.min(10, nextState)),
      },
    },
  });
};

export const incrementGraphDependentsMaxDepth = (
  current: Config,
  onChange: (nextConfig: Config) => void,
  increment: number
) =>
  setGraphDependenciesMaxDepth(
    current,
    onChange,
    current.graph.dependents.maxDepth + increment
  );

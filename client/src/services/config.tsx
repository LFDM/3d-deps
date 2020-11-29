import React, { useContext } from "react";
import {
  CONFIG,
  Config,
  GraphConfig,
  HotkeyConfig,
  HudConfig,
  Theme,
} from "../types/Config";

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
  setGraphDependentsMaxDepth(
    current,
    onChange,
    current.graph.dependents.maxDepth + increment
  );

export const toggleShowExcludedNodes = (
  current: Config,
  onChange: (nextConfig: Config) => void,
  nextState: boolean = !current.hud.search.showExcludedNodes
) => {
  return onChange({
    ...current,
    hud: {
      ...current.hud,
      search: {
        ...current.hud.search,
        showExcludedNodes: nextState,
      },
    },
  });
};

export type SerializedConfig = {
  theme: Omit<Theme, "spacing"> & { spacing: { unit: number } };
  graph: Omit<GraphConfig, "excludeByPath" | "includeByPath"> & {
    excludeByPath: string;
    includeByPath: string;
  };
  hud: HudConfig;
  hotkeys: HotkeyConfig;
};

export const deserializeConfig = (conf: SerializedConfig): Config => {
  return {
    theme: {
      ...conf.theme,
      spacing: (multiplier = 1) => conf.theme.spacing.unit * multiplier,
    },
    graph: {
      ...conf.graph,
      excludeByPath: conf.graph.excludeByPath
        ? new RegExp(conf.graph.excludeByPath)
        : null,
      includeByPath: conf.graph.includeByPath
        ? new RegExp(conf.graph.includeByPath)
        : null,
    },
    hud: conf.hud,
    hotkeys: conf.hotkeys,
  };
};

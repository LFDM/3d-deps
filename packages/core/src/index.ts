import {
  Config,
  CONFIG,
  deserializeConfig,
  GraphConfig,
  Hotkey,
  HotkeyConfig,
  HudConfig,
  MAX_GRAPH_HIGHLIGHT_DEPTH,
  mergeConfigs,
  mergeWithDefaultConfig,
  PartialGraphConfig,
  PartialHotkeyConfig,
  PartialHudConfig,
  PartialTheme,
  serializeConfig,
  SerializedConfig,
  Theme,
} from "./config";

export {
  MAX_GRAPH_HIGHLIGHT_DEPTH,
  Theme,
  PartialTheme,
  GraphConfig,
  PartialGraphConfig,
  HudConfig,
  PartialHudConfig,
  Hotkey,
  HotkeyConfig,
  PartialHotkeyConfig,
  SerializedConfig,
  Config,
  CONFIG,
  serializeConfig,
  deserializeConfig,
  mergeConfigs,
  mergeWithDefaultConfig,
};

export type DependencyNode = {
  id: string;
  path: string;
  name: string;
  labels: string[];
  dependsOn: string[];
};

export type DebugMessage = {
  type: string;
  msg: string;
  data?: any;
};

export type Issue = any; // TBD

export type DependencyAnalyzerMeta = {
  analyzer?: {
    name: string;
    version?: string;
  };
  repository?: {
    url: string;
  };
  createdAt: string; // iso 8601
};

export type DependencyAnalyzerResult = {
  nodes: DependencyNode[];
  debug?: DebugMessage[];
  issues?: Issue[];
  meta?: DependencyAnalyzerMeta;
};

export interface IDependencyAnalyzer {
  analyze: () => Promise<DependencyAnalyzerResult>;
}

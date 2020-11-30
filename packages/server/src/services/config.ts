import {
  Config,
  GraphConfig,
  HotkeyConfig,
  HudConfig,
  Theme,
} from "@3d-deps/config";
type Omit<T, K> = { [key in Exclude<keyof T, K>]: T[key] };

// everything can be partial here too
type SerializedConfig = {
  theme: Omit<Theme, "spacing"> & { spacing: { unit: number } };
  graph: Omit<GraphConfig, "excludeByPath" | "includeByPath"> & {
    excludeByPath: string;
    includeByPath: string;
  };
  hud: HudConfig;
  hotkeys: HotkeyConfig;
};

export const serializeConfig = (conf: Config): SerializedConfig => {
  return {
    theme: {
      ...conf.theme,
      spacing: { unit: conf.theme.spacing(1) },
    },
    graph: {
      ...conf.graph,
      excludeByPath: conf.graph.excludeByPath?.toString() || "",
      includeByPath: conf.graph.includeByPath?.toString() || "",
    },
    hud: conf.hud,
    hotkeys: conf.hotkeys,
  };
};

export const MAX_GRAPH_HIGHLIGHT_DEPTH = 15;

export type Theme = {
  typography: {
    font: string;
    backgroundColor: string;
    color: string;
  };
  hud: {
    color: string;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    opacity: number;
  };
  spacing: (multiplier?: number) => number;
  graph: {
    nodes: {
      colors: {
        standard: string;
        selected: string;
        unselected: string;
        dependent: string;
        dependency: string;
      };
    };
    links: {
      colors: {
        standard: string;
        dependent: string;
        dependency: string;
        unselected: string;
      };
    };
  };
};

export type GraphConfig = {
  dependencies: {
    maxDepth: number;
  };
  dependents: {
    maxDepth: number;
  };
  excludeByPath?: RegExp | null;
  includeByPath?: RegExp | null;
};

export type HudConfig = {
  sidebar: {
    open: boolean;
  };
  search: {
    showExcludedNodes: boolean;
  };
};

export type Hotkey =
  | "hud.sidebar.toggle"
  | "hud.sidebar.openNodesPanel"
  | "hud.sidebar.openConfigPanel"
  | "hud.sidebar.openHistoryPanel"
  | "hud.search"
  | "hud.hotkeyInfo"
  | "graph.dependencies.maxDepth.increase"
  | "graph.dependencies.maxDepth.decrease"
  | "graph.dependents.maxDepth.increase"
  | "graph.dependents.maxDepth.decrease"
  | "graph.selectedNode.exclude"
  | "graph.selectedNode.toggleDetails"
  | "graph.selectedNode.toggleSelection"
  | "graph.selectedNode.history.forward"
  | "graph.selectedNode.history.backward";

export type HotkeyConfig = { [K in Hotkey]: string[] };

export type Config = {
  theme: Theme;
  graph: GraphConfig;
  hud: HudConfig;
  hotkeys: HotkeyConfig;
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

export const deserializeConfig = (conf: SerializedConfig): Config => {
  return {
    theme: {
      ...conf.theme,
      spacing: (multiplier = 1) => conf.theme.spacing.unit * multiplier,
    },
    graph: {
      ...conf.graph,
      excludeByPath: conf.graph.excludeByPath
        ? new RegExp(conf.graph.excludeByPath.slice(1, -1))
        : null,
      includeByPath: conf.graph.includeByPath
        ? new RegExp(conf.graph.includeByPath.slice(1, -1))
        : null,
    },
    hud: conf.hud,
    hotkeys: conf.hotkeys,
  };
};

export const CONFIG: Config = {
  theme: {
    typography: {
      font: "400 14px Arial",
      backgroundColor: "#141414",
      color: "#f4f4f4",
    },
    hud: {
      color: "#f4f4f4",
      primaryColor: "#ea6161",
      backgroundColor: "#1e1e1e",
      secondaryColor: "#1c5cc2",
      opacity: 0.75,
    },
    spacing: (multiplier = 1) => multiplier * 8,
    graph: {
      nodes: {
        colors: {
          standard: "#fcf4b0",
          selected: "#A992EE",
          unselected: "#343434", //  "#050505" darker, basically black
          dependency: "#f47560", // #B5503D darker - darker is better. then the color dropoff for indirect nodes could be steeper too
          dependent: "#61cdbb", // #258374 darker
        },
      },
      links: {
        colors: {
          standard: "#d3d3d3",
          dependency: "#f47560",
          dependent: "#61cdbb",
          unselected: "#343434", //  "#050505" darker, basically black
        },
      },
    },
  },
  graph: {
    dependencies: {
      maxDepth: 1,
    },
    dependents: {
      maxDepth: 1,
    },
    includeByPath: null,
    excludeByPath: /(^helpers.ts|^domainTypes|^versions|^services\/firebase)/,
  },
  hud: {
    sidebar: {
      open: true,
    },
    search: {
      showExcludedNodes: true,
    },
  },
  hotkeys: {
    "hud.sidebar.toggle": ["alt+b"],
    "hud.sidebar.openNodesPanel": ["alt+n"],
    "hud.sidebar.openHistoryPanel": ["alt+h"],
    "hud.sidebar.openConfigPanel": ["alt+c"],
    "hud.search": ["/", "f"],
    "hud.hotkeyInfo": ["shift+/"], // ? doesn't seem to work
    "graph.dependencies.maxDepth.increase": ["alt+k", "alt+up"],
    "graph.dependencies.maxDepth.decrease": ["alt+j", "alt+down"],
    "graph.dependents.maxDepth.increase": ["alt+shift+k", "alt+shift+up"],
    "graph.dependents.maxDepth.decrease": ["alt+shift+j", "alt+shift+down"],
    "graph.selectedNode.exclude": ["del"],
    "graph.selectedNode.toggleDetails": ["d"],
    "graph.selectedNode.toggleSelection": ["s"],
    "graph.selectedNode.history.forward": ["j"],
    "graph.selectedNode.history.backward": ["k"],
  },
};

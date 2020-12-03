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
    labels: {
      palette: string[];
    };
  };
};

// Type it out instead of using a recursive type - as this is a primary way
// for users to define Configs, it enhances readability.
export type PartialTheme = {
  typography?: {
    font?: string;
    backgroundColor?: string;
    color?: string;
  };
  hud?: {
    color?: string;
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    opacity?: number;
  };
  spacing?: (multiplier?: number) => number;
  graph?: {
    nodes?: {
      colors?: {
        standard?: string;
        selected?: string;
        unselected?: string;
        dependent?: string;
        dependency?: string;
      };
    };
    links?: {
      colors?: {
        standard?: string;
        dependent?: string;
        dependency?: string;
        unselected?: string;
      };
    };
  };
};

// export type NodeLabel = {
//   id: string;
//   name: string;
//   color: string;
// };

export type GraphConfig = {
  dependencies: {
    maxDepth: number;
  };
  dependents: {
    maxDepth: number;
  };
  excludeByPath?: RegExp | null;
  includeByPath?: RegExp | null;

  // labels: {
  //   nodes: NodeLabel[];
  // };
};

export type PartialGraphConfig = {
  dependencies?: {
    maxDepth?: number;
  };
  dependents?: {
    maxDepth?: number;
  };
  excludeByPath?: RegExp | null;
  includeByPath?: RegExp | null;

  // labels?: {
  //   nodes?: NodeLabel[];
  // };
};

export type HudConfig = {
  sidebar: {
    open: boolean;
  };
  search: {
    showExcludedNodes: boolean;
  };
};

export type PartialHudConfig = {
  sidebar?: {
    open?: boolean;
  };
  search?: {
    showExcludedNodes?: boolean;
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
export type PartialHotkeyConfig = { [K in Hotkey]?: string[] };

export type Config = {
  theme: Theme;
  graph: GraphConfig;
  hud: HudConfig;
  hotkeys: HotkeyConfig;
};

export type PartialConfig = {
  theme?: PartialTheme;
  graph?: PartialGraphConfig;
  hud?: PartialHudConfig;
  hotkeys?: PartialHotkeyConfig;
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

export const mergeConfigs = (config: Config, ...partials: PartialConfig[]) => {
  return partials.reduce<Config>((m, p) => {
    const merged: Config = {
      ...m,
      theme: {
        ...m.theme,
        ...p.theme,
        typography: {
          ...m.theme.typography,
          ...p.theme?.typography,
        },
        hud: {
          ...m.theme.hud,
          ...p.theme?.hud,
        },
        graph: {
          ...m.theme.graph,
          nodes: {
            ...m.theme.graph.nodes,
            colors: {
              ...m.theme.graph.nodes.colors,
              ...p.theme?.graph?.nodes?.colors,
            },
          },
          links: {
            ...m.theme.graph.links,
            colors: {
              ...m.theme.graph.links.colors,
              ...p.theme?.graph?.links?.colors,
            },
          },
        },
      },
      graph: {
        ...m.graph,
        ...p.graph,
        dependencies: {
          ...m.graph.dependencies,
          ...p.graph?.dependencies,
        },
        dependents: {
          ...m.graph.dependents,
          ...p.graph?.dependents,
        },
        // labels: {
        //   ...m.graph.labels,
        //   nodes: {
        //     ...m.graph.labels.nodes,
        //     ...p.graph?.labels?.nodes,
        //   },
        // },
      },
      hud: {
        ...m.hud,
        ...p.hud,
        sidebar: {
          ...m.hud.sidebar,
          ...p.hud?.sidebar,
        },
        search: {
          ...m.hud.search,
          ...p.hud?.search,
        },
      },
      hotkeys: {
        ...m.hotkeys,
        ...p.hotkeys,
      },
    };
    return merged;
  }, config);
};

export const mergeWithDefaultConfig = (...partials: PartialConfig[]) => {
  return mergeConfigs(CONFIG, ...partials);
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
      labels: {
        palette: [
          "#e8c1a0",
          "#f47560",
          "#f1e15b",
          "#e8a838",
          "#61cdbb",
          "#97e3d5",
          "#009bc1",
        ],
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
    excludeByPath: null,

    // labels: {
    //   nodes: [],
    // },
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

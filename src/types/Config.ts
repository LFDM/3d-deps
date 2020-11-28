export type Theme = {
  typography: {
    font: string;
    backgroundColor: string;
    color: string;
  };
  hud: {
    color: string;
    highlightColor: string;
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
  excludeByPath?: RegExp;
};

export type HudConfig = {
  sidebar: {
    open: boolean;
  };
};

export type Hotkey =
  | "hud.sidebar.toggle"
  | "hud.sidebar.openNodesPanel"
  | "hud.sidebar.openConfigPanel"
  | "hud.search"
  | "hud.hotkeyInfo"
  | "graph.dependencies.maxDepth.increase"
  | "graph.dependencies.maxDepth.decrease"
  | "graph.dependents.maxDepth.increase"
  | "graph.dependents.maxDepth.decrease"
  | "graph.selectedNode.exclude"
  | "graph.selectedNode.toggleDetails";

export type HotkeyConfig = { [K in Hotkey]: string[] };

export type Config = {
  theme: Theme;
  graph: GraphConfig;
  hud: HudConfig;
  hotkeys: HotkeyConfig;
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
      highlightColor: "#ea6161",
      backgroundColor: "#1e1e1e",
      opacity: 0.75,
    },
    spacing: (multiplier = 1) => multiplier * 8,
    graph: {
      nodes: {
        colors: {
          standard: "#fcf4b0",
          selected: "#A992EE",
          unselected: "#050505",
          dependency: "#f47560",
          dependent: "#61cdbb",
        },
      },
      links: {
        colors: {
          standard: "#d3d3d3",
          dependency: "#f47560",
          dependent: "#61cdbb",
          unselected: "#050505",
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
    excludeByPath: /(^helpers.ts|^domainTypes|^versions|^services\/firebase)/,
  },
  hud: {
    sidebar: {
      open: true,
    },
  },
  hotkeys: {
    "hud.sidebar.toggle": ["alt+b"],
    "hud.sidebar.openNodesPanel": ["alt+n"],
    "hud.sidebar.openConfigPanel": ["alt+c"],
    "hud.search": ["/", "f"],
    "hud.hotkeyInfo": ["?"],
    "graph.dependencies.maxDepth.increase": ["alt+k", "alt+up"],
    "graph.dependencies.maxDepth.decrease": ["alt+j", "alt+down"],
    "graph.dependents.maxDepth.increase": ["alt+shift+k", "alt+shift+up"],
    "graph.dependents.maxDepth.decrease": ["alt+shift+j", "alt+shift+down"],
    "graph.selectedNode.exclude": ["del"],
    "graph.selectedNode.toggleDetails": ["d"],
  },
};

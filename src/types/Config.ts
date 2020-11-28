export type Theme = {
  typography: {
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

export type HotkeyConfig = {
  "hud.sidebar.toggle": string[];
  "hud.sidebar.openNodesPanel": string[];
  "hud.sidebar.openConfigPanel": string[];
  "hud.search": string[];
  "hud.toggleHotkeyInfo": string[];
  "graph.dependencies.maxDepth.increase": string[];
  "graph.dependencies.maxDepth.decrease": string[];
  "graph.dependents.maxDepth.increase": string[];
  "graph.dependents.maxDepth.decrease": string[];
  "graph.selectedNode.exclude": string[];
  "graph.selectedNode.toggleDetails": string[];
};

export type Config = {
  theme: Theme;
  graph: GraphConfig;
  hud: HudConfig;
  hotkeys: HotkeyConfig;
};

export const CONFIG: Config = {
  theme: {
    typography: {
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
    "hud.toggleHotkeyInfo": ["?"],
    "graph.dependencies.maxDepth.increase": ["ctrl+j", "ctrl+up"],
    "graph.dependencies.maxDepth.decrease": ["ctrl+k", "ctrl+down"],
    "graph.dependents.maxDepth.increase": ["ctrl+alt+k", "ctrl+alt+down"],
    "graph.dependents.maxDepth.decrease": ["ctrl+alt+k", "ctrl+alt+down"],
    "graph.selectedNode.exclude": ["del"],
    "graph.selectedNode.toggleDetails": ["d"],
  },
};

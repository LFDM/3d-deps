export type Theme = {
  typography: {
    backgroundColor: string;
    color: string;
  };
  hud: {
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

export const THEME: Theme = {
  typography: {
    backgroundColor: "#141414",
    color: "#f4f4f4",
  },
  hud: {
    backgroundColor: "#1e1e1e",
    opacity: 0.75,
  },
  spacing: (multiplier = 1) => multiplier * 8,
  graph: {
    nodes: {
      colors: {
        standard: "#fcf4b0",
        selected: "#e8a838",
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
};

export type Config = {
  theme: Theme;
};

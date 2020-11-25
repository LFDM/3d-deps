export type Theme = {
  typography: {
    backgroundColor: string;
    color: string;
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
  spacing: (multiplier = 1) => multiplier * 8,
  graph: {
    nodes: {
      colors: {
        standard: "#fcf4b0",
        selected: "#e8a838",
        unselected: "black",
        dependency: "#f47560",
        dependent: "#61cdbb",
      },
    },
    links: {
      colors: {
        standard: "lightgray",
        dependency: "#f47560",
        dependent: "#61cdbb",
        unselected: "black",
      },
    },
  },
};

export type Config = {
  theme: Theme;
};

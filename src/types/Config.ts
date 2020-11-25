export type Theme = {
  graph: {
    background: {
      color: string;
    };
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
  graph: {
    background: {
      color: "#141414",
    },
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

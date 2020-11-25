export type Theme = {
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
      };
    };
  };
};
export type Config = {
  theme: Theme;
};

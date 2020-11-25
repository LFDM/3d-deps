export type Theme = {
  graph: {
    nodes: {
      colors: {
        standard: string;
        selection: string;
        dependent: string;
        dependency: string;
      };
    };
  };
};
export type Config = {
  theme: Theme;
};

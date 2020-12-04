import { Dataset, mergeWithDefaultConfig } from "@3d-deps/core";

export const REACT: Dataset = {
  name: "React",
  fetch: async () => ({
    config: mergeWithDefaultConfig({
      graph: {
        excludeByPath: /((^|\/)node_modules\/)/,
      },
    }),
    data: (await import("./data.json")).default,
  }),
};

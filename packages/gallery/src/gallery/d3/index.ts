import { Dataset, mergeWithDefaultConfig } from "@3d-deps/core";

export const D3: Dataset = {
  name: "d3",
  fetch: async () => ({
    config: mergeWithDefaultConfig({
      graph: {
        excludeByPath: /((^|\/)node_modules\/)/,
      },
    }),
    data: (await import("./data.json")).default,
  }),
};

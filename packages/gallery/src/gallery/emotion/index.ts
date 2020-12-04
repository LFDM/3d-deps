import { Dataset, mergeWithDefaultConfig } from "@3d-deps/core";

export const EMOTION: Dataset = {
  name: "emotion",
  fetch: async () => ({
    config: mergeWithDefaultConfig({
      graph: {
        excludeByPath: /((^|\/)node_modules\/)/,
      },
    }),
    data: (await import("./data.json")).default,
  }),
};

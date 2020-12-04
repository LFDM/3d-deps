import { Dataset, mergeWithDefaultConfig } from "@3d-deps/core";

export const THREE_D_DEPS: Dataset = {
  name: "3d-deps",
  fetch: async () => ({
    config: mergeWithDefaultConfig({
      graph: {
        excludeByPath: /((^|\/)node_modules\/)/,
      },
    }),
    data: (await import("./data.json")).default,
  }),
};

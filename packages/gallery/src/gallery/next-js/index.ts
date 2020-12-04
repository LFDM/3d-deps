import { Dataset, mergeWithDefaultConfig } from "@3d-deps/core";

export const NEXT_JS: Dataset = {
  name: "Next.js",
  fetch: async () => ({
    config: mergeWithDefaultConfig({
      graph: {
        excludeByPath: /((^|\/)node_modules\/)/,
      },
    }),
    data: { nodes: [] },
  }),
};

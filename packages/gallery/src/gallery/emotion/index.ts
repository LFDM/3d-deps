import { Dataset, mergeWithDefaultConfig } from "@3d-deps/core";

export const EMOTION: Dataset = {
  name: "emotion",
  icon:
    "https://raw.githubusercontent.com/emotion-js/emotion/master/emotion.png",
  fetch: async () => ({
    config: mergeWithDefaultConfig({
      graph: {
        excludeByPath: /((^|\/)node_modules\/)/,
      },
    }),
    data: (await import("./data.json")).default,
  }),
};

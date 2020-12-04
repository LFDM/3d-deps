import { Dataset, mergeWithDefaultConfig } from "@3d-deps/core";

export const THREE_JS: Dataset = {
  name: "Three.js",
  icon:
    "https://pbs.twimg.com/profile_images/1156268573137833984/5gdpZtDv_400x400.jpg",
  fetch: async () => ({
    config: mergeWithDefaultConfig({
      graph: {
        excludeByPath: /((^|\/)node_modules\/)/,
      },
    }),
    data: (await import("./data.json")).default,
  }),
};

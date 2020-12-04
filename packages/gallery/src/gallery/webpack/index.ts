import { Dataset, mergeWithDefaultConfig } from "@3d-deps/core";

export const WEBPACK: Dataset = {
  name: "webpack",
  icon: "https://raw.githubusercontent.com/webpack/media/master/logo/icon.svg",
  fetch: async () => ({
    config: mergeWithDefaultConfig({
      graph: {
        excludeByPath: /((^|\/)node_modules\/)/,
      },
    }),
    data: (await import("./data.json")).default,
  }),
};

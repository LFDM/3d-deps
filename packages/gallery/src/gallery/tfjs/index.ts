import { Dataset, mergeWithDefaultConfig } from "@3d-deps/core";

export const TENSORFLOW_JS: Dataset = {
  name: "TensorFlow.js",
  icon:
    "https://www.gstatic.com/devrel-devsite/prod/v82ddc984cee1a5dd6ee4c16cb38492e67eefd500032375cc23778d6489eec4cb/tensorflow/images/favicon.png",
  fetch: async () => ({
    config: mergeWithDefaultConfig({
      graph: {
        excludeByPath: /((^|\/)node_modules\/)/,
      },
    }),
    data: (await import("./data.json")).default,
  }),
};

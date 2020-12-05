import { Dataset, mergeWithDefaultConfig } from "@3d-deps/core";

export const D3: Dataset = {
  name: "D3",
  icon:
    "https://camo.githubusercontent.com/586ccf0aad9684edc821658cee04146cf36d1f1d5ec904bbefd72728909ccb2e/68747470733a2f2f64336a732e6f72672f6c6f676f2e737667",
  fetch: async () => ({
    config: mergeWithDefaultConfig({
      graph: {
        excludeByPath: /((^|\/)node_modules\/)/,
      },
    }),
    data: (await import("./data.json")).default,
  }),
};

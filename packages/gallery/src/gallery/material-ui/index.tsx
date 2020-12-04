import { Dataset, mergeWithDefaultConfig } from "@3d-deps/core";

export const MATERIAL_UI: Dataset = {
  name: "Material UI",
  icon:
    "https://camo.githubusercontent.com/58423e406b227112756822122631d9eca5ab83334a6f0d8f2a6305b086815747/68747470733a2f2f6d6174657269616c2d75692e636f6d2f7374617469632f6c6f676f2e73766",
  fetch: async () => ({
    config: mergeWithDefaultConfig({
      graph: {
        excludeByPath: /((^|\/)node_modules\/)/,
      },
    }),
    data: (await import("./data.json")).default,
  }),
};

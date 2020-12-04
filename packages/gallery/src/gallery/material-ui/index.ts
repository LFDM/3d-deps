import { Dataset, mergeWithDefaultConfig } from "@3d-deps/core";

export const MATERIAL_UI: Dataset = {
  name: "Material UI",
  icon: "https://material-ui.com/static/logo_raw.svg",
  fetch: async () => ({
    config: mergeWithDefaultConfig({
      graph: {
        excludeByPath: /((^|\/)node_modules\/|packages\/material-ui-icons)/,
      },
    }),
    data: (await import("./data.json")).default,
  }),
};

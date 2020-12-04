import { Dataset, mergeWithDefaultConfig } from "@3d-deps/core";

export const FIREBASE_JS_SDK: Dataset = {
  name: "Firebase JS SDK",
  icon:
    "https://firebase.google.com/downloads/brand-guidelines/SVG/logo-logomark.svg",
  fetch: async () => ({
    config: mergeWithDefaultConfig({
      graph: {
        excludeByPath: /((^|\/)node_modules\/)/,
      },
    }),
    data: (await import("./data.json")).default,
  }),
};

import { RunConfig } from "@3d-deps/core";
import { THREE_D_DEPS } from "./gallery/3d-deps";
import { MATERIAL_UI } from "./gallery/material-ui";
import { NIVO } from "./gallery/nivo";
import { REACT } from "./gallery/react";
import { THREE_JS } from "./gallery/three-js";
import { WEBPACK } from "./gallery/webpack";

export const getConfig = (): RunConfig => {
  return {
    version: 1,
    loadDatasets: async () => [
      THREE_D_DEPS,
      MATERIAL_UI,
      NIVO,
      REACT,
      THREE_JS,
      WEBPACK,
    ],
  };
};

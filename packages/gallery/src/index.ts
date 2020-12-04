import { RunConfig } from "@3d-deps/core";
import { MATERIAL_UI } from "./gallery/material-ui";
import { NIVO } from "./gallery/nivo";
import { REACT } from "./gallery/react";
import { THREE_JS } from "./gallery/three-js";
import { WEBPACK } from "./gallery/webpack";

export const getConfig = (): RunConfig => {
  return {
    version: 1,
    loadDatasets: async () => [MATERIAL_UI, NIVO, REACT, THREE_JS, WEBPACK],
  };
};

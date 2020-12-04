import { RunConfig } from "@3d-deps/core";
import { NIVO } from "./gallery/nivo";
import { REACT } from "./gallery/react";
import { WEBPACK } from "./gallery/webpack";

export const getConfig = (): RunConfig => {
  return {
    version: 1,
    loadDatasets: async () => [NIVO, REACT, WEBPACK],
  };
};

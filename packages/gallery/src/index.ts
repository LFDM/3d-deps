import { RunConfig } from "@3d-deps/core";
import { REACT } from "./gallery/react";

export const getConfig = (): RunConfig => {
  return {
    version: 1,
    loadDatasets: async () => [REACT],
  };
};

import { RunConfig } from "@3d-deps/core";
import { THREE_D_DEPS } from "./gallery/3d-deps";
import { D3 } from "./gallery/d3";
import { EMOTION } from "./gallery/emotion";
import { FIREBASE_JS_SDK } from "./gallery/firebase-js-sdk";
// import { FIREBASE_TOOLS } from "./gallery/firebase-tools";
import { LUXON } from "./gallery/luxon";
import { MATERIAL_UI } from "./gallery/material-ui";
import { NEXT_JS } from "./gallery/next-js";
import { NIVO } from "./gallery/nivo";
import { REACT } from "./gallery/react";
import { TENSORFLOW_JS } from "./gallery/tfjs";
import { THREE_JS } from "./gallery/three-js";
import { WEBPACK } from "./gallery/webpack";

export const getConfig = (): RunConfig => {
  return {
    version: 1,
    loadDatasets: async () => [
      THREE_D_DEPS,
      D3,
      EMOTION,
      FIREBASE_JS_SDK,
      LUXON,
      MATERIAL_UI,
      NEXT_JS,
      NIVO,
      REACT,
      TENSORFLOW_JS,
      THREE_JS,
      WEBPACK,
    ],
  };
};

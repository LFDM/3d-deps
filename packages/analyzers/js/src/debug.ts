import debugFn from "debug";
const LABEL = "analyzer-js";
export const debug = debugFn(LABEL);
export const createDebugger = (subLabel: string) =>
  debugFn(`${LABEL}-${subLabel}`);

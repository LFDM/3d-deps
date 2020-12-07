import debugFn from "debug";
const LABEL = "analyzer-js";
export const debugInfo = debugFn(LABEL);
export const debugVerbose = debugFn(`${LABEL}-verbose`);
export const createDebugger = (subLabel: string) =>
  debugFn(`${LABEL}-${subLabel}`);

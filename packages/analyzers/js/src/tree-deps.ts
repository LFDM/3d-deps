// @ts-ignore
import cabinet from "filing-cabinet";
// @ts-ignore
import * as precinct from "precinct";
import { CompilerOptions } from "typescript";
import { debugInfo, debugVerbose } from "./debug";

type Result = { [absFileName: string]: string[] };

export type LookupOptions = {
  directory: string;
  requireConfig?: string;
  webpackConfig?: string;
  nodeModulesConfig?: string;
  failedLookups?: { parent: string; missing: string }[];
  tsCompilerOptions?: CompilerOptions;
  precinctOptions?: object;
  filter?: (dependencyPath: string, parentPath: string) => boolean;
  customFileLookup: (p: string) => string | undefined;
};

export const lookupDependencies = (
  result: Result,
  fileName: string,
  config: LookupOptions
): void => {
  if (result[fileName]) {
    debugVerbose("already visited", fileName);
    return;
  }

  let dependencies: string[];
  try {
    dependencies = precinct.paperwork(fileName, {
      ...config.precinctOptions,
      includeCore: false,
    });
  } catch (err) {
    debugInfo("error by precinct", err?.message, err?.stack);
    result[fileName] = [];
    return;
  }

  const resolvedDependencies: string[] = [];
  for (const d of dependencies) {
    if (config.customFileLookup) {
      const customLookup = config.customFileLookup(d);
      if (customLookup) {
        resolvedDependencies.push(customLookup);
        continue;
      }
    }
    try {
      const result = cabinet({
        partial: d,
        filename: fileName,
        directory: config.directory,
        ast: precinct.ast,
        config: config.requireConfig,
        webpackConfig: config.webpackConfig,
        nodeModulesConfig: config.nodeModulesConfig,
        tsCompilerOptions: config.tsCompilerOptions,
      });
      if (result) {
        resolvedDependencies.push(result);
      } else {
        debugInfo(`empty filepath for ${d}`);
        config.failedLookups?.push({ parent: fileName, missing: d });
      }
    } catch (err) {
      debugInfo("error by cabinet", d, err?.message, err?.stack);
    }
  }
  const finalDependencies = config.filter
    ? resolvedDependencies.filter((nextD) => config.filter!(nextD, fileName))
    : resolvedDependencies;

  result[fileName] = finalDependencies;
  for (const nextD of finalDependencies) {
    lookupDependencies(result, nextD, config);
  }
};

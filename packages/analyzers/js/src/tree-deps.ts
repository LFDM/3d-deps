// @ts-ignore
import cabinet from "filing-cabinet";
// @ts-ignore
import * as precinct from "precinct";
import { CompilerOptions } from "typescript";
import { createDebugger, debug } from "./debug";

const debugVerbose = createDebugger("verbose");

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
    debug("error by precinct", err?.message, err?.stack);
    result[fileName] = [];
    return;
  }

  const resolvedDependencies: string[] = [];
  for (const d of dependencies) {
    if (config.filter) {
      if (!config.filter(d, fileName)) {
        debug("filtered out", d);
        continue;
      }
    }

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
        debug(`empty filepath for ${d}`);
        config.failedLookups?.push({ parent: fileName, missing: d });
      }
    } catch (err) {
      debug("error by cabinet", d, err?.message, err?.stack);
    }
  }
  result[fileName] = resolvedDependencies;
  console.log(resolvedDependencies);
  for (const nextD of resolvedDependencies) {
    lookupDependencies(result, nextD, config);
  }
};

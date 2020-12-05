import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { getCompilerOptions } from "./ts";
import {
  Config,
  ConfigTransformer,
  Entry,
  FullEntry,
  PackageJson,
} from "./types";

const access = promisify(fs.access);
const canRead = async (p: string) => {
  try {
    await access(p, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
};

const getEntries = (pkg: PackageJson): FullEntry[] => {
  const entries: FullEntry[] = [];

  if (pkg.main) {
    entries.push({ path: pkg.main, type: "main" });
  }
  const browser =
    typeof pkg.browser === "string"
      ? [pkg.browser]
      : Object.values(pkg.browser || {});
  browser.forEach((p) => entries.push({ path: p, type: "browser" }));
  const bin =
    typeof pkg.bin === "string" ? [pkg.bin] : Object.values(pkg.bin || {});
  bin.forEach((p) => entries.push({ path: p, type: "bin" }));

  return entries;
};
const DEFAULT_TRANSFORMER = (): ConfigTransformer => {
  return async ({ dir, packageJson }) => {
    const entries = getEntries(packageJson);
    const configs: Config["configs"] = {};
    const defaultTsConfigPath = path.join(dir, "tsconfig.json");
    if (await canRead(defaultTsConfigPath)) {
      configs.ts = {
        compilerOptions: getCompilerOptions(defaultTsConfigPath),
      };
    }
    return { entries, configs };
  };
};

export const TRANSFORMERS: {
  DEFAULT: () => ConfigTransformer;
  MAP_ENTRY: (
    mapper: (entry: FullEntry) => Entry | Promise<Entry>,
    args: { dir: string; packageJson: PackageJson }
  ) => ConfigTransformer;
} = {
  DEFAULT: DEFAULT_TRANSFORMER,
  MAP_ENTRY: (mapper) => async (args) => {
    const cfg = await DEFAULT_TRANSFORMER()(args);
    const entries = await Promise.all(
      cfg.entries.map((e) =>
        typeof e === "string" ? mapper({ path: e, type: undefined }) : mapper(e)
      )
    );
    return { ...cfg, entries };
  },
};

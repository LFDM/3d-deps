import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { getCompilerOptions } from "./ts";
import { Config, ConfigTransformer, Entries, PackageJson } from "./types";

const access = promisify(fs.access);
const canRead = async (p: string) => {
  try {
    await access(p, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
};

const getEntries = (pkg: PackageJson): Entries => {
  const entries: Entries = { main: null, browser: null, bin: [] };

  if (pkg.main) {
    entries.main = pkg.main;
  }
  if (pkg.browser) {
    entries.browser = pkg.browser;
  }
  if (typeof pkg.bin === "string") {
    entries.bin.push(pkg.bin);
  }
  if (typeof pkg.bin === "object") {
    entries.bin.push(...Object.values(pkg.bin));
  }
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
  MAP_ENTRY: (mapper: (entry: string) => string | null) => ConfigTransformer;
} = {
  DEFAULT: DEFAULT_TRANSFORMER,
  MAP_ENTRY: (mapper) => async (args) => {
    const cfg = await DEFAULT_TRANSFORMER()(args);
    const entries: Entries = { main: null, browser: null, bin: [] };
    entries.main = cfg.entries.main ? mapper(cfg.entries.main) : null;
    entries.browser = cfg.entries.browser ? mapper(cfg.entries.browser) : null;

    for (const e of cfg.entries.bin) {
      const nextE = mapper(e);
      if (nextE) {
        entries.bin.push(nextE);
      }
    }
    return { ...cfg, entries };
  },
};

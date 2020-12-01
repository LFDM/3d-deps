import { ConfigTransformer, Entries, PackageJson } from "./types";

const getEntries = (pkg: PackageJson): Entries => {
  const entries: Entries = { main: null, bin: [] };

  if (pkg.main) {
    entries.main = pkg.main;
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
  return async ({ packageJson }) => {
    const entries = getEntries(packageJson);
    return { entries };
  };
};

export const TRANSFORMERS: {
  DEFAULT: () => ConfigTransformer;
  MAP_ENTRY: (mapper: (entry: string) => string | null) => ConfigTransformer;
} = {
  DEFAULT: DEFAULT_TRANSFORMER,
  MAP_ENTRY: (mapper) => async (args) => {
    const cfg = await DEFAULT_TRANSFORMER()(args);
    const entries: Entries = { main: null, bin: [] };
    entries.main = cfg.entries.main ? mapper(cfg.entries.main) : null;

    for (const e of cfg.entries.bin) {
      const nextE = mapper(e);
      if (nextE) {
        entries.bin.push(nextE);
      }
    }
    return { entries };
  },
};

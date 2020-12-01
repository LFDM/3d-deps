import { ConfigTransformer, PackageJson } from "./types";

const getEntries = (pkg: PackageJson) => {
  const entries: string[] = [];
  if (pkg.main) {
    entries.push(pkg.main);
  }
  if (typeof pkg.bin === "string") {
    entries.push(pkg.bin);
  }
  if (typeof pkg.bin === "object") {
    entries.push(...Object.values(pkg.bin));
  }
  return entries;
};
const DEFAULT_TRANSFORMER = (): ConfigTransformer => {
  return async ({ packageJson }) => {
    const entries = getEntries(packageJson);
    return entries.length ? { entries } : null;
  };
};

export const TRANSFORMERS: {
  DEFAULT: () => ConfigTransformer;
  MAP_ENTRY: (mapper: (entry: string) => string | null) => ConfigTransformer;
} = {
  DEFAULT: DEFAULT_TRANSFORMER,
  MAP_ENTRY: (mapper) => async (args) => {
    const cfg = await DEFAULT_TRANSFORMER()(args);
    if (!cfg) {
      return null;
    }
    const entries: string[] = [];
    for (const e of cfg.entries) {
      const nextE = mapper(e);
      if (nextE === null) {
        return null;
      }
      entries.push(nextE);
    }
    return entries.length ? { entries } : null;
  },
};

import { CompilerOptions } from "typescript";

export type FullEntry = {
  path: string;
  type: "main" | "bin" | "browser" | "module" | undefined;
};

export type Entry = string | FullEntry;

export type Config = {
  entries: FullEntry[];
  cleanupPath?: (p: string, pkg: PackageJson) => string;
  configs?: {
    ts?: {
      compilerOptions: CompilerOptions;
    };
  };
  // ... other stuff like tsConfig
};

export type ConfigTransformer = (args: {
  dir: string;
  packageJson: PackageJson;
}) => Promise<Config> | Config;

export type PackageJson = object & {
  name: string;
  version: string;
  main?: string;
  module?: string;
  browser?: string | { [key: string]: string };
  bin?: string | { [key: string]: string };
  types?: string;
  workspaces?: string[];
  repository?: string | { url: string; type: string; directory?: string };
  dependencies: { [key: string]: string };
  devDependencies: { [key: string]: string };
  peerDependencies: { [key: string]: string };
};

export type FlatTree = { [key: string]: string[] };

export type Workspaces = {
  [key: string]: {
    location: string;
  };
};

export type NodeModulesResolution = "shallow" | "deep";

export type PackageInfo = {
  pkg: PackageJson;

  mappedEntries: {
    abs: string;
    rel: string;
    type: FullEntry["type"];
  }[];

  configs: {
    ts?: {
      compilerOptions: CompilerOptions;
    };
  };

  locationOfSrc: {
    abs: string;
    rel: string;
  };
  locationInNodeModules: {
    abs: string;
    rel: string;
  } | null;
  mountLocation: {
    abs: string;
    rel: string;
  };

  cleanupPath?: (p: string, pkg: PackageJson) => string;
};

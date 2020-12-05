import { CompilerOptions } from "typescript";

export type FullEntry = {
  path: string;
  type: "main" | "bin" | "browser" | "module" | undefined;
};

export type Entry = string | FullEntry;

export type Config = {
  entries: FullEntry[];
  configs: {
    ts?: {
      compilerOptions: CompilerOptions;
    };
  };
  // ... other stuff like tsConfig
};

export type ConfigTransformer = (args: {
  dir: string;
  packageJson: PackageJson;
}) => Promise<Config>;

export type PackageJson = object & {
  name: string;
  version: string;
  main?: string;
  browser?: string | { [key: string]: string };
  bin?: string | { [key: string]: string };
  types?: string;
  workspaces?: string[];
  repository?: string | { url: string; type: string; directory?: string };
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
  location: {
    abs: string;
    rel: string;
  };

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
};

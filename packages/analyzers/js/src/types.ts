import { CompilerOptions } from "typescript";

export type Entries = {
  main: string | null;
  browser: string[];
  bin: string[];
};

export type Config = {
  entries: Entries;
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
    main: {
      abs: string | null;
      rel: string | null;
    };
    browser: {
      abs: string;
      rel: string;
    }[];
    bin: {
      abs: string;
      rel: string;
    }[];
  };

  configs: {
    ts?: {
      compilerOptions: CompilerOptions;
    };
  };
};

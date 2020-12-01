export type Entries = {
  main: string | null;
  bin: string[];
};

export type Config = {
  entries: Entries;
  // ... other stuff like tsConfig
};

export type ConfigTransformer = (args: {
  dir: string;
  packageJson: PackageJson;
}) => Promise<Config>;

export type PackageJson = object & {
  main?: string;
  bin?: string | { [key: string]: string };
  workspaces?: string[];
};

export type FlatTree = { [key: string]: string[] };

export type Yarn1Workspace = {
  location: string;
  workspaceDependencies: string[];
  mismatchedWorkspaceDependencies: string[];
};

export type Workspaces = {
  [key: string]: {
    path: string;
  };
};

export type NodeModulesResolution = "shallow" | "deep";

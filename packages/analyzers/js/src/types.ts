export type Config = {
  entries: string[];
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

export type YarnWorkspace = {
  location: string;
  workspaceDependencies: string[];
  mismatchedWorkspaceDependencies: string[];
};

export type YarnWorkspacesInfo = { [key: string]: YarnWorkspace };

export type Config = {
  entries: string[];
  // ... other stuff like tsConfig
};

export type ConfigTransformer = (args: {
  dir: string;
  packageJson: PackageJson;
}) => Promise<Config | null>;

export type PackageJson = object & {
  main?: string;
  bin?: string | { [key: string]: string };
  workspaces?: string[];
};

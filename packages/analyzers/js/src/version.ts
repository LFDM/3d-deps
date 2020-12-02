import { PackageJson } from "./types";

export const getVersion = () => {
  const pkg: PackageJson = require("../package.json");
  return pkg.version;
};

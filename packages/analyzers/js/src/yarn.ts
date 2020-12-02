import * as cP from "child_process";
import debugFn from "debug";
import * as path from "path";
import stripAnsi from "strip-ansi";
import { promisify } from "util";
import { Workspaces } from "./types";

const debug = debugFn("analyzer-js-yarn");

const exec = promisify(cP.exec);

const getVersion = async (rootDir: string): Promise<1 | 2 | null> => {
  const { stdout } = await exec("yarn --version", {
    cwd: rootDir,
  });
  const version = stripAnsi(stdout).trim();
  const [major] = version.split(".");
  if (major === "1") {
    return 1;
  }
  if (major === "2") {
    return 2;
  }
  return null;
};

type Yarn1Workspace = {
  location: string;
  workspaceDependencies: string[];
  mismatchedWorkspaceDependencies: string[];
};

const getWorkspaceInfoForYarn1 = async (
  rootDir: string
): Promise<Workspaces> => {
  const { stdout } = await exec("yarn --silent workspaces info", {
    cwd: rootDir,
  });
  const ws: { [key: string]: Yarn1Workspace } = JSON.parse(stripAnsi(stdout));
  const result: Workspaces = {};
  Object.entries(ws).map(([k, v]) => {
    result[k] = { location: path.join(rootDir, v.location) };
  });
  return result;
};

type Yarn2Workspace = {
  name: string;
  location: string;
};

const getWorkspaceInfoForYarn2 = async (
  rootDir: string
): Promise<Workspaces> => {
  const result: Workspaces = {};
  const { stdout } = await exec("yarn workspaces list --json", {
    cwd: rootDir,
  });
  const items = stdout
    .trim()
    .split("\n")
    .map<Yarn2Workspace>((l) => JSON.parse(l));
  items.forEach(({ name, location }) => {
    result[name] = { location: path.join(rootDir, location) };
  });
  return result;
};

export const getWorkspacesInfo = async (
  rootDir: string
): Promise<Workspaces> => {
  const version = await getVersion(rootDir);
  if (version === 1) {
    return getWorkspaceInfoForYarn1(rootDir);
  }
  if (version === 2) {
    return getWorkspaceInfoForYarn2(rootDir);
  }
  debug("Unsupported yarn version - skipping");
  return {};
};

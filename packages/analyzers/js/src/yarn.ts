import * as cP from "child_process";
import * as path from "path";
import stripAnsi from "strip-ansi";
import { promisify } from "util";
import { Workspaces, YarnWorkspace } from "./types";

const exec = promisify(cP.exec);

export const getWorkspacesInfo = async (
  rootDir: string
): Promise<Workspaces> => {
  const { stdout } = await exec("yarn --silent workspaces info", {
    cwd: rootDir,
  });
  const ws: { [key: string]: YarnWorkspace } = JSON.parse(stripAnsi(stdout));
  const result: Workspaces = {};
  Object.entries(ws).map(([k, v]) => {
    result[k] = { path: path.join(rootDir, v.location) };
  });
  return result;
};

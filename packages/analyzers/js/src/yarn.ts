import * as cP from "child_process";
import stripAnsi from "strip-ansi";
import { promisify } from "util";
import { YarnWorkspacesInfo } from "./types";

const exec = promisify(cP.exec);

export const getWorkspacesInfo = async (
  rootDir: string
): Promise<YarnWorkspacesInfo> => {
  const { stdout } = await exec("yarn --silent workspaces info", {
    cwd: rootDir,
  });
  return JSON.parse(stripAnsi(stdout));
};

import * as fs from "fs";
import * as path from "path";
import * as util from "util";

export const getRootDir = (argv: string[]) => {
  const p = argv[2];
  return path.isAbsolute(p) ? p : path.join(process.cwd(), process.argv[2]);
};

export const writeFile = util.promisify(fs.writeFile);
export const writeJsonFile = (p: string, obj: any) =>
  writeFile(p, JSON.stringify(obj, null, 2));

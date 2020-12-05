import * as fs from "fs";
import _glob from "glob";
import * as path from "path";
import * as util from "util";

export const getRootDir = (argv: string[]) => {
  const p = argv[2];
  return path.isAbsolute(p) ? p : path.join(process.cwd(), process.argv[2]);
};

export const readFile = util.promisify(fs.readFile);
export const readJsonFile = <T = any>(p: string) =>
  readFile(p).then((o) => JSON.parse(p.toString()) as T);
export const writeFile = util.promisify(fs.writeFile);
export const writeJsonFile = (p: string, obj: any) =>
  writeFile(p, JSON.stringify(obj, null, 2));

export const glob = util.promisify(_glob);

import * as path from "path";
import ts from "typescript";

export const getCompilerOptions = (p: string): ts.CompilerOptions => {
  const config = ts.readJsonConfigFile(p, ts.sys.readFile);
  const parsed = ts.parseJsonSourceFileConfigFileContent(
    config,
    ts.sys,
    path.dirname(p)
  );

  return parsed.options;
};

#!/usr/bin/env node

import { getTsCompilerOptions, JsAnalyzer } from "@3d-deps/analyzer-js";
import * as path from "path";
import { getRootDir, writeJsonFile } from "../util";

const analyzer = new JsAnalyzer({
  rootDir: getRootDir(process.argv),
  configTransformer: () => {
    return {
      entries: [
        {
          type: "main",
          path: "./src/index.ts",
        },
      ],
      configs: {
        ts: {
          compilerOptions: getTsCompilerOptions("tsconfig.json"),
        },
      },
      cleanupPath: (p) =>
        p.startsWith("dist")
          ? p.replace("dist", "src").replace(".d.ts", ".ts")
          : p,
    };
  },
  workspaces: {
    virtual: async ({ rootPkg }) => {
      return Object.entries<string>(rootPkg.dependencies)
        .filter(([k]) => k.startsWith("@tensorflow"))
        .map(([k, v]) => ({
          packageName: k,
          mountPoint: v.replace("link:..", ""),
        }));
    },
  },
});

analyzer
  .analyze()
  .then((res) => writeJsonFile(path.join(__dirname, "data.json"), res));

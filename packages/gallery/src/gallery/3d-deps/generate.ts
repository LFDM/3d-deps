#!/usr/bin/env node

import { getTsCompilerOptions, JsAnalyzer } from "@3d-deps/analyzer-js";
import * as path from "path";
import { getRootDir, writeJsonFile } from "../util";

const analyzer = new JsAnalyzer({
  rootDir: getRootDir(process.argv),
  configTransformer: async ({ packageJson }) => {
    if (!packageJson.main) {
      return {
        entries: [],
        configs: {},
      };
    }

    return {
      entries: [
        {
          type: "main",
          path: packageJson.main.replace("dist", "src").replace("js", "ts"),
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
});

analyzer
  .analyze()
  .then((res) => writeJsonFile(path.join(__dirname, "data.json"), res));

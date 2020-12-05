#!/usr/bin/env node

import { JsAnalyzer } from "@3d-deps/analyzer-js";
import * as path from "path";
import { getRootDir, readJsonFile, writeJsonFile } from "../util";

const generate = async () => {
  const rootDir = getRootDir(process.argv);
  const packageJson = await readJsonFile(path.join(rootDir, "package.json"));
  const d3Packages = Object.keys(packageJson.dependencies).filter((k) =>
    k.startsWith("d3")
  );

  const analyzer = new JsAnalyzer({
    rootDir,
    configTransformer: async ({ packageJson }) => {
      return {
        entries: [
          {
            type: "main",
            path: packageJson.module || "./src/index.js",
          },
        ],
        configs: {},
      };
    },
    workspaces: {
      virtual: d3Packages.map((packageName) => ({
        packageName,
        mountPoint: "packages",
      })),
    },
  });

  analyzer
    .analyze()
    .then((res) => writeJsonFile(path.join(__dirname, "data.json"), res));
};

generate();

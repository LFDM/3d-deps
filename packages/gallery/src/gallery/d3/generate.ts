#!/usr/bin/env node

import { JsAnalyzer } from "@3d-deps/analyzer-js";
import * as path from "path";
import { getRootDir, writeJsonFile } from "../util";

const analyzer = new JsAnalyzer({
  rootDir: getRootDir(process.argv),
  configTransformer: async ({ packageJson }) => {
    return {
      entries: [
        {
          type: "main",
          path: packageJson.module || "./src/index.js",
        },
      ],
      configs: {},
      cleanupPath: (p, pkg) => (p === pkg.main ? pkg.module || p : p),
    };
  },
  workspaces: {
    virtual: async (packageJson) => {
      const d3Packages = Object.keys(packageJson.dependencies).filter((k) =>
        k.startsWith("d3")
      );
      return d3Packages.map((packageName) => ({
        packageName,
        mountPoint: "packages",
      }));
    },
  },
});

analyzer
  .analyze()
  .then((res) => writeJsonFile(path.join(__dirname, "data.json"), res));

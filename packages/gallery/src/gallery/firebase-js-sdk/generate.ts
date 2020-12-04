#!/usr/bin/env node

import { JsAnalyzer, TRANSFORMERS } from "@3d-deps/analyzer-js";
import * as fs from "fs";
import * as path from "path";
import { getRootDir, writeJsonFile } from "../util";

const analyzer = new JsAnalyzer({
  rootDir: getRootDir(process.argv),
  configTransformer: async ({ dir, packageJson }) => {
    const defaults = await TRANSFORMERS.DEFAULT()({ dir, packageJson });
    if (fs.existsSync(path.join(dir, "index.ts"))) {
      defaults.entries.main = "index.ts";
    } else if (fs.existsSync(path.join(dir, "src", "index.ts"))) {
      defaults.entries.main = path.join("src/index.ts");
    }
    return defaults;
  },
});

analyzer
  .analyze()
  .then((res) => writeJsonFile(path.join(__dirname, "data.json"), res));

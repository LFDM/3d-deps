#!/usr/bin/env node

import { JsAnalyzer, TRANSFORMERS } from "@3d-deps/analyzer-js";
import * as fs from "fs";
import * as path from "path";
import { getRootDir, writeJsonFile } from "../util";

const analyzer = new JsAnalyzer({
  rootDir: getRootDir(process.argv),
  configTransformer: TRANSFORMERS.MAP_ENTRY((entry, args) => {
    if (entry.type === "main") {
      if (fs.existsSync(path.join(args.dir, "index.ts"))) {
        entry.path = "index.ts";
      } else if (fs.existsSync(path.join(args.dir, "src", "index.ts"))) {
        entry.path = path.join("src/index.ts");
      }
    }
    return entry;
  }),
});

analyzer
  .analyze()
  .then((res) => writeJsonFile(path.join(__dirname, "data.json"), res));

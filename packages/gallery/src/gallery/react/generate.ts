#!/usr/bin/env node

import { JsAnalyzer, TRANSFORMERS } from "@3d-deps/analyzer-js";
import * as path from "path";
import { getRootDir, glob, writeJsonFile } from "../util";

const analyzer = new JsAnalyzer({
  rootDir: getRootDir(process.argv),
  configTransformer: async (args) => {
    const cfg = await TRANSFORMERS.DEFAULT()(args);
    if (args.packageJson.name === "shared") {
      cfg.entries = (
        await glob("*.js", {
          cwd: args.dir,
        })
      ).map((p) => ({ type: undefined, path: p }));
      return cfg;
    }
    const main = cfg.entries.find((e) => e.type === "main");
    if (main) {
      main.path = main.path.replace("dist", "src");
    } else {
      cfg.entries.push({ type: "main", path: "index.js" });
    }
    return cfg;
  },
});

analyzer
  .analyze()
  .then((res) => writeJsonFile(path.join(__dirname, "data.json"), res));

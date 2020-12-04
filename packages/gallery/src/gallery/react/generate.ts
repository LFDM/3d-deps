#!/usr/bin/env node

import { JsAnalyzer, TRANSFORMERS } from "@3d-deps/analyzer-js";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";

const writeFile = util.promisify(fs.writeFile);

const DIR = __dirname;
const p = process.argv[2];

const analyzer = new JsAnalyzer({
  rootDir: path.isAbsolute(p) ? p : path.join(DIR, process.argv[2]),
  configTransformer: async (args) => {
    const cfg = await TRANSFORMERS.DEFAULT()(args);
    return {
      ...cfg,
      entries: {
        ...cfg.entries,
        main: cfg.entries.main?.replace("dist/", "src/") || "./index.js",
      },
    };
  },
});

analyzer
  .analyze()
  .then((res) =>
    writeFile(path.join(DIR, "data.json"), JSON.stringify(res, null, 2))
  );

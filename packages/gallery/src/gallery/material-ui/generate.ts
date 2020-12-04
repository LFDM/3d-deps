#!/usr/bin/env node

import { JsAnalyzer, TRANSFORMERS } from "@3d-deps/analyzer-js";
import * as path from "path";
import { getRootDir, writeJsonFile } from "../util";

const analyzer = new JsAnalyzer({
  rootDir: getRootDir(process.argv),
  configTransformer: TRANSFORMERS.MAP_ENTRY((e) => e.replace(/\.ts$/, ".js")),
});

analyzer
  .analyze()
  .then((res) => writeJsonFile(path.join(__dirname, "data.json"), res));

import * as path from "path";
import { JsAnalyzer } from ".";
import { TRANSFORMERS } from "./transformers";

const analyzer = new JsAnalyzer({
  // rootDir: path.join(__dirname, "..", "..", "..", "..", "..", "babel"),
  // rootDir: path.join(__dirname, "..", "..", "..", "..", "..", "react"),
  rootDir: path.join(__dirname, "..", "..", "..", ".."),
  configTransformer: TRANSFORMERS.MAP_ENTRY((entry) =>
    entry.replace("dist/index.js", "src/index.ts")
  ),
});

analyzer.analyze().then((res) => console.log(JSON.stringify(res, null, 2)));

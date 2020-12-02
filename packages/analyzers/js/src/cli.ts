import * as path from "path";
import { JsAnalyzer } from ".";
import { TRANSFORMERS } from "./transformers";

const analyzer = new JsAnalyzer({
  // rootDir: path.join(__dirname, "..", "..", "..", "..", "..", "babel"),
  rootDir: path.join(__dirname, "..", "..", "..", "..", "..", "react"),
  // rootDir: path.join(__dirname, "..", "..", "..", ".."),
  configTransformer: async (args) => {
    const cfg = await TRANSFORMERS.DEFAULT()(args);
    return {
      ...cfg,
      entries: {
        ...cfg.entries,
        main: cfg.entries.main?.replace("/dist/", "/src/") || "./index.js",
      },
    };
  },
});

analyzer.analyze().then((res) => console.log(JSON.stringify(res, null, 2)));

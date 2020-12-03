import * as path from "path";
import { JsAnalyzer } from ".";
import { TRANSFORMERS } from "./transformers";

const analyzer = new JsAnalyzer({
  // rootDir: path.join(__dirname, "..", "..", "..", ".."),
  // configTransformer: TRANSFORMERS.MAP_ENTRY((e) =>
  //   e.replace("dist/", "src/").replace(/.js$/, ".ts")
  // ),

  // rootDir: path.join(__dirname, "..", "..", "..", "..", "..", "babel"),

  // rootDir: path.join(__dirname, "..", "..", "..", "..", "..", "react"),
  // configTransformer: async (args) => {
  //   const cfg = await TRANSFORMERS.DEFAULT()(args);
  //   return {
  //     ...cfg,
  //     entries: {
  //       ...cfg.entries,
  //       main: cfg.entries.main?.replace("dist/", "src/") || "./index.js",
  //     },
  //   };
  // },

  // rootDir: path.join(__dirname, "..", "..", "..", "..", "..", "next.js"),
  // configTransformer: TRANSFORMERS.MAP_ENTRY((e) =>
  //   e.replace("dist/", "").replace(/.js$/, ".ts")
  // ),

  rootDir: path.join(__dirname, "..", "..", "..", "..", "..", "nivo"),
  configTransformer: async (args) => {
    const cfg = await TRANSFORMERS.DEFAULT()(args);
    return {
      ...cfg,
      entries: {
        ...cfg.entries,
        main: "src/index.js",
      },
    };
  },
});

analyzer.analyze().then((res) => console.log(JSON.stringify(res, null, 2)));

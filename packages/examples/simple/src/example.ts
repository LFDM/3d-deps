import { JsAnalyzer, TRANSFORMERS } from "@3d-deps/analyzer-js";
import { CONFIG } from "@3d-deps/core";
import { createServer } from "@3d-deps/server";
import * as path from "path";

const ROOT = path.join(__dirname, "..");

const server = createServer({
  version: 1,
  loadDatasets: async () => {
    return [
      {
        name: "Simple Example",
        fetch: async () => ({
          config: CONFIG,
          data: await new JsAnalyzer({
            rootDir: ROOT,
            configTransformer: TRANSFORMERS.MAP_ENTRY(() => "./src/index.ts"),
          }).analyze(),
        }),
      },
    ];
  },
});

server.start({ port: 8011, openBrowser: true });

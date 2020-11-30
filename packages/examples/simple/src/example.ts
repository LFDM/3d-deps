import { MadgeAnalyzer } from "@3d-deps/analyzer-madge";
import { CONFIG } from "@3d-deps/config";
import { createServer } from "@3d-deps/server";
import * as path from "path";

const SRC = __dirname;

const madgeAnalzer = new MadgeAnalyzer({
  entry: path.join(SRC, "index.ts"),
  tsConfig: path.join(SRC, "..", "tsconfig.json"),
});

const server = createServer({
  version: 1,
  loadDatasets: async () => {
    return [
      {
        name: "Simple Example",
        fetch: async () => ({
          config: CONFIG,
          data: await madgeAnalzer.analyze(),
        }),
      },
    ];
  },
});

server.start({ port: 8011, openBrowser: true });

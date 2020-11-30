import { CONFIG } from "@3d-deps/config";
import { createServer } from "@3d-deps/server";

const server = createServer({
  version: 1,
  loadDatasets: async () => {
    return [
      {
        name: "Simple Example",
        fetch: async () => ({
          config: CONFIG,
          data: [],
        }),
      },
    ];
  },
});

server.start({ port: 8011, openBrowser: true });

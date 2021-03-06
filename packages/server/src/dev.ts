import { CONFIG } from "@3d-deps/core";
import { createServer } from ".";

const server = createServer({
  loadDatasets: async () => {
    return [
      {
        name: "3d-deps server",
        fetch: async () => {
          return {
            config: CONFIG,
            data: {
              nodes: [],
            },
          };
        },
      },
      {
        name: "3d-deps client",
        fetch: async () => {
          return {
            config: CONFIG,
            data: {
              nodes: [],
            },
          };
        },
      },
    ];
  },
  version: 1,
});

server.start({
  port: parseInt(process.env.PORT || "", 10) || 8000,
  openBrowser: false,
});

import * as path from "path";
import yargs from "yargs";
import { createServer } from "./server";

const argv = yargs(process.argv)
  .option("port", {
    alias: "p",
    type: "number",
  })
  .option("config", {
    alias: "c",
    type: "string",
  }).argv;

// FIXME absolute paths!
const configPath = path.join(process.cwd(), argv.config || "3d-deps.config.js");
const port = argv.port || parseInt(process.env.PORT || "", 10) || 8000;

const server = createServer(configPath);
server.start(port);

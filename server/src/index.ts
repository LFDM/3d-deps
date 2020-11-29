import express from "express";
import open from "open";
import * as path from "path";
import yargs from "yargs";
import { RunConfig } from "./types/RunConfig";

const argv = yargs(process.argv)
  .option("port", {
    alias: "p",
    type: "number",
  })
  .option("config", {
    alias: "c",
    type: "string",
  }).argv;

const readConfig = (): RunConfig | null => {
  try {
    const cwd = process.cwd();
    return require(path.join(cwd, argv.config || "3d-deps.config.js"));
  } catch {
    return null;
  }
};

const app = express();
const PORT = argv.port || process.env.PORT || 8000;

const CLIENT_BUILD = path.join(__dirname, "..", "client_build");
app.use(express.static(CLIENT_BUILD));

app.get("/", (req, res) => res.redirect("/app"));

app.get("/api/datasets", async (req, res) => {
  const conf = readConfig();

  if (!conf) {
    res.status(400).json({
      // TODO extract error codes and provide them to the client
      message: "NO_CONFIG",
    });
    return;
  }
  if (!conf.loadDatasets) {
    res.status(400).json({
      message: "ILLEGAL_CONFIG",
    });
    return;
  }
  if (typeof conf.version === undefined) {
    res.status(400).json({
      message: "VERSION_MISSING",
    });
    return;
  }
  console.log(conf);

  console.log("Datasets requested!");
  res.json([]);
});

app.get("/app/*", (req, res) => {
  res.sendFile(path.join(CLIENT_BUILD, "index.html"));
});

app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Server running at ${url}`);
  if (!process.env.NO_OPEN) {
    open(url);
  }
});

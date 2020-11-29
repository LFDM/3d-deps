import express from "express";
import open from "open";
import * as path from "path";
import yargs from "yargs";
import { Dataset, RunConfig } from "./types/RunConfig";

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

const DATASETS: { [key: string]: Dataset } = {};

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
  try {
    const datasets = await conf.loadDatasets();
    const datasetsWithId = datasets.map((d) => ({
      id: Buffer.from(d.name).toString("base64"),
      d,
    }));
    datasetsWithId.forEach((d) => (DATASETS[d.id] = d.d));
    res.json(datasetsWithId.map((d) => ({ id: d.id, name: d.d.name })));
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "FAILED_TO_LOAD_DATASETS",
    });
  }
});

app.get("/api/datasets/:id", async (req, res) => {
  const dataset = DATASETS[req.params.id];
  if (!dataset) {
    res.status(404).json({ message: "DATA_SET_NOT_FOUND" });
  }
  const d = await dataset.fetch();
  return res.json(d);
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

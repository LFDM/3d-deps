import express from "express";
import open from "open";
import * as path from "path";
import { serializeConfig } from "./services/config";
import { Dataset, RunConfig } from "./types/RunConfig";

const readConfig = (cfgPath: string): RunConfig | null => {
  try {
    return require(cfgPath);
  } catch {
    return null;
  }
};

type Server = {
  start: (port: number, openBrowser?: boolean) => Promise<Express.Application>;
};

export const createServer = (configPath: string): Server => {
  const app = express();

  const CLIENT_BUILD = path.join(__dirname, "..", "..", "client_build");
  app.use(express.static(CLIENT_BUILD));

  app.get("/", (req, res) => res.redirect("/app"));

  const DATASETS: { [key: string]: Dataset } = {};

  app.get("/api/datasets", async (req, res) => {
    const conf = readConfig(configPath);

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
    return res.json({
      data: d.data,
      config: serializeConfig(d.config),
    });
  });

  app.get("/app/*", (req, res) => {
    res.sendFile(path.join(CLIENT_BUILD, "index.html"));
  });

  const server: Server = {
    start: (port, openBrowser) => {
      return new Promise((resolve, reject) => {
        try {
          app.listen(port, () => {
            const url = `http://localhost:${port}`;
            console.log(`Server running at ${url}`);
            openBrowser && open(url);
            resolve(app);
          });
        } catch (err) {
          reject(err);
        }
      });
    },
  };

  return server;
};

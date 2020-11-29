import express from "express";
import open from "open";
import * as path from "path";

const app = express();
const PORT = 8000; // read from config file later

const CLIENT_BUILD = path.join(__dirname, "..", "client_build");
app.use(express.static(CLIENT_BUILD));

app.get("/", (req, res) => res.redirect("/app"));

app.get("/api/datasets", (req, res) => {
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

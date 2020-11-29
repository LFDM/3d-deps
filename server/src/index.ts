import express from "express";
import * as path from "path";

const app = express();
const PORT = 8000; // read from config file later

const CLIENT_BUILD = path.join(__dirname, "..", "client_build");
app.use(express.static(CLIENT_BUILD));

app.get("/", (req, res) => res.redirect("/app"));
app.get("/app/*", (req, res) => {
  res.sendFile(path.join(CLIENT_BUILD, "index.html"));
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);

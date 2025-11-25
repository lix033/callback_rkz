const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const { mkdir, appendFile } = require("fs/promises");
const dotenv = require("dotenv");
const moment = require("moment");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_DIR = process.env.LOG_DIR || path.resolve("./logs");
const LOG_FILE = process.env.LOG_FILE || "debit_callback.log";

// On regroupe le code asynchrone dans une IIFE
(async () => {
  await mkdir(LOG_DIR, { recursive: true });
  const accessLogStream = fs.createWriteStream(path.join(LOG_DIR, "access.log"), { flags: "a" });

  app.use(helmet());
  app.use(morgan("combined", { stream: accessLogStream }));
  app.use(express.json());

  app.post("/callbacks/debit", async (req, res) => {
    try {
      await appendFile(
        path.join(LOG_DIR, LOG_FILE),
        `[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${JSON.stringify(req.body)}\n\n`,
        "utf8"
      );

      console.log("Payload reçu :", req.body);
      res.json({ status: "success", message: "Payload reçu et enregistré" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ status: "error", message: "Erreur serveur" });
    }
  });

  app.all("/callbacks/debit", (_req, res) => {
    res.set("Allow", "POST").status(405).json({ status: "error", message: "Méthode non autorisée" });
  });

  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
})();


import express from "express";
import Logger from "./logger";
import CLILogger from "./logger/cli";
import ENV from "./env";

const cliLogger = new CLILogger();
const logger = new Logger([cliLogger]);
const env = new ENV(logger);

const PORT = +env.variables.PORT || 8000;

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Service Running, NMT Data Bridge!");
});

app.listen(PORT, async () => {
  await logger.info(`Server is running on http://localhost:${PORT}`);
});

import express from "express";

import cors from "cors";
import { WorkOS } from "@workos-inc/node";
import JWKSClient from "jwks-rsa";

import DatabaseAccessLayer from "./database/access-layer";
import CLILogger from "./logger/cli";
import DatabaseLogger from "./logger/database";
import Logger, { ILoggerVariants } from "./logger";
import ENV from "./env";
import Services from "./services";
import { corsOptions } from "./utils/config";

import serviceStatus from "./controllers/service/status";
import authenticate from "./controllers/auth/authenticate";
import errorHandler from "./controllers/error/handler";

const database = new DatabaseAccessLayer();

const cliLogger = new CLILogger();
const databaseLogger = new DatabaseLogger(database);
const logger = new Logger([cliLogger, databaseLogger]);
const env = new ENV(logger);

const services = new Services(logger, database);

const PORT = +env.variables.PORT || 8000;

const app = express();

const workos = new WorkOS(env.variables.WORKOS_AUTHKIT_SECRET_KEY, {
  clientId: env.variables.WORKOS_AUTHKIT_CLIENT_KEY,
});

const jwks = JWKSClient({
  jwksUri: workos.userManagement.getJwksUrl(
    env.variables.WORKOS_AUTHKIT_CLIENT_KEY
  ),
});

app.use(cors(corsOptions));
app.use(express.json());
app.disable("etag");

app.use((req, _, next) => {
  req.logger = logger;
  req.env = env;
  req.workos = workos;
  req.jwks = jwks;
  req.user = null;
  req.services = services;
  next();
});

app.get("/", serviceStatus);

app.use(authenticate);

app.get("/api/protected", async (req, res) => {
  res.send(`This is a protected route ${req.user?.userId}`);
});

app.use(errorHandler);

app.listen(PORT, async () => {
  // Grouped Logging
  // This will log all messages within the group in batch whenever the logger.end() is called.
  // passing ILoggerVariants as [] or undefined will log to all loggers.
  // IMPORTANT: Make sure to pass the logId to logs which need to be grouped.
  const id = logger.start();
  await logger.info("Server", `Running on http://localhost:${PORT}`, [], id);
  await logger.end(id);

  // Simple Logging
  // Passing ILoggerVariants restricts to the specified loggers only.
  // i.e. in this case, only the CLI logger will log this message.
  await logger.info("Logging Sample", `This is a sample Logging.`, [
    ILoggerVariants.CLI,
  ]);
});

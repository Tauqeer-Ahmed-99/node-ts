import express from "express";

import cors from "cors";
import { WorkOS } from "@workos-inc/node";
import JWKSClient from "jwks-rsa";

import DatabaseAccessLayer from "./database/access-layer";
import CLILogger from "./logger/cli";
import DatabaseLogger from "./logger/database";
import { Logger, ILoggerVariants } from "./logger";
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

app.use(authenticate);

// Middleware to attach a per-request logger with
// user context by this time user object is set in req.user
app.use((req, _, next) => {
  req.logger = new Logger([cliLogger, databaseLogger], req.user);
  req.env = env;
  req.workos = workos;
  req.jwks = jwks;
  req.services = services;
  next();
});

app.get("/", serviceStatus);

app.use((req, _, next) => {
  const logger = new Logger([cliLogger, databaseLogger], req.user);
  req.logger = logger;
  next();
});

app.use(errorHandler);

app.listen(PORT, async () => {
  /**
   * GROUPED LOGGING
   *
   * Grouped logging allows you to batch multiple log messages under a single group (logId).
   * - Use logger.start() to create a new group and get a logId.
   * - Pass this logId to all logger calls you want to group.
   * - When logger.end(logId) is called, all grouped logs are flushed as a single batch log.
   *
   * Edge Cases & Behaviors:
   * - If you pass a logId to logger.info/success/warn/error and the logId does not exist, the log is not recorded and an error is printed.
   * - If you call logger.end() with a non-existent logId, nothing is flushed and an error is printed.
   * - If you do not call logger.end(logId), the grouped logs are never flushed (memory leak risk if used in long-running processes).
   * - Passing an empty array or undefined for variants logs to all logger variants (CLI, FILE, DATABASE, etc.).
   * - Grouped logs are not immediately dispatched; they are only sent when logger.end() is called.
   * - The user context at the time of logger.end() is used for the final batch log.
   *
   * Example:
   */
  const id = logger.start();
  await logger.info("Server", `Running on http://localhost:${PORT}`, [], id);
  await logger.end(id);

  /**
   * SIMPLE LOGGING
   *
   * Simple logging sends a single log message immediately to the specified logger variants.
   * - You can restrict the log to specific variants by passing an array (e.g., [ILoggerVariants.CLI]).
   * - If you pass an empty array or undefined, the log is sent to all logger variants.
   * - The user context at the time of the log call is used.
   *
   * Edge Cases & Behaviors:
   * - If a variant is specified but no logger of that variant exists, nothing happens for that variant.
   * - If the log call fails for a variant, the error is caught and logged to the console, but other variants still attempt to log.
   * - If user context is not set, user will be null in the log.
   * - No logId should be passed for simple logs; if you do, it will attempt to group (see grouped logging above).
   *
   * Example:
   */
  await logger.info("Logging Sample", "This is a sample Logging.", [
    ILoggerVariants.CLI,
  ]);
});

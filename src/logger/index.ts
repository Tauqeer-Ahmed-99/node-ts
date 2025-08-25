import { v4 as uuidv4 } from "uuid";

import { AuthUser } from "../types/auth";
import chalk from "chalk";

export enum ILoggerVariants {
  CLI = "cli",
  FILE = "file",
  DATABASE = "database",
}

export type LogLevel = "info" | "success" | "warn" | "error";

export type LogMessage = {
  id: string;
  level: LogLevel;
  logName: string;
  message: string;
  timestamp: Date;
};

export interface ILogger {
  variant: ILoggerVariants;

  info: (
    logName: string,
    message: string,
    timestamp: Date,
    user: AuthUser
  ) => Promise<boolean>;
  success: (
    logName: string,
    message: string,
    timestamp: Date,
    user: AuthUser
  ) => Promise<boolean>;
  warn: (
    logName: string,
    message: string,
    timestamp: Date,
    user: AuthUser
  ) => Promise<boolean>;
  error: (
    logName: string,
    message: string,
    timestamp: Date,
    user: AuthUser
  ) => Promise<boolean>;
}

class Logger {
  private loggers: ILogger[];
  private logs = new Map<string, LogMessage[]>();

  user: AuthUser = null;

  constructor(loggers: ILogger[]) {
    this.loggers = loggers;
  }

  private getLoggers = (variants: ILoggerVariants[]) => {
    return this.loggers.filter(
      (logger) =>
        variants.length > 0 ? variants.includes(logger.variant) : true // Include all loggers if no variants are specified
    );
  };

  private getContent = (
    level: LogLevel,
    logName: string,
    message: string,
    timestamp: Date,
    user: AuthUser = null
  ) => {
    const content = `${chalk.bgBlue(`[${level.toUpperCase()}]`)} ${chalk.blue(
      `[${timestamp.toISOString()}] ${
        user ? `[Requested By: ${user.userId}]` : ""
      } [${logName}] ${message}`
    )}`;
    return content;
  };

  private log = async (
    logName: string,
    message: string,
    level: LogLevel,
    variants: ILoggerVariants[],
    logId?: string
  ) => {
    const timestamp = new Date();

    if (logId) {
      if (this.logs.has(logId)) {
        this.logs.get(logId)?.push({
          id: logId,
          level,
          logName,
          message,
          timestamp,
        });
        console.error(`Logs with id not found ${logId}`);
        return Promise.resolve(false);
      }

      return Promise.resolve(false);
    }

    return Promise.all(
      this.getLoggers(variants).map((logger) =>
        logger[level](logName, message, timestamp, this.user)
      )
    )
      .then(() => true)
      .catch(() => false);
  };

  start = () => {
    const id = uuidv4();
    this.logs.set(id, []);
    return id;
  };

  end = async (logId: string) => {
    const logs = this.logs.get(logId);

    if (!logs) {
      console.error(`Logs with id not found ${logId}`);
      return Promise.resolve(true);
    }

    const content = logs
      .map((log) =>
        this.getContent(
          log.level,
          log.logName,
          log.message,
          log.timestamp,
          this.user
        )
      )
      .join("\n");

    return this.log(`[LogId: ${logId}]`, content, "info", [])
      .then((isSuccess) => {
        this.logs.delete(logId);
        return isSuccess;
      })
      .catch(() => {
        return false;
      });
  };

  info = (
    logName: string,
    message: string,
    variants: ILoggerVariants[] = [],
    logId?: string
  ): Promise<boolean> => this.log(logName, message, "info", variants, logId);

  success = (
    logName: string,
    message: string,
    variants: ILoggerVariants[] = [],
    logId?: string
  ): Promise<boolean> => this.log(logName, message, "success", variants, logId);

  warn = (
    logName: string,
    message: string,
    variants: ILoggerVariants[] = [],
    logId?: string
  ): Promise<boolean> => this.log(logName, message, "warn", variants, logId);

  error = (
    logName: string,
    message: string,
    variants: ILoggerVariants[] = [],
    logId?: string
  ): Promise<boolean> => this.log(logName, message, "error", variants, logId);
}

export default Logger;

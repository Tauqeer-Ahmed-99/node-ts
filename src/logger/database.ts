import chalk from "chalk";
import { ILogger, ILoggerVariants, LogLevel } from ".";
import TraceLogsService from "../services/trace-logs-service";
import DatabaseAccessLayer from "../database/access-layer";
import { AuthUser } from "../types/auth";

class DatabaseLogger implements ILogger {
  readonly variant = ILoggerVariants.DATABASE;

  private traceLogsService: TraceLogsService;

  constructor(database: DatabaseAccessLayer) {
    this.traceLogsService = new TraceLogsService(database);
  }

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

  info = async (
    logName: string,
    message: string,
    timestamp: Date,
    user: AuthUser = null
  ) => {
    try {
      const content = this.getContent("info", logName, message, timestamp);
      await this.traceLogsService.logInfo(logName, content, user?.userId);
      return true;
    } catch (error) {
      console.error("Error logging info:", error);
      return false;
    }
  };

  success = async (
    logName: string,
    message: string,
    timestamp: Date,
    user: AuthUser = null
  ) => {
    try {
      const content = this.getContent("success", logName, message, timestamp);
      await this.traceLogsService.logSuccess(logName, content, user?.userId);
      return true;
    } catch (error) {
      console.error("Error logging success:", error);
      return false;
    }
  };

  warn = async (
    logName: string,
    message: string,
    timestamp: Date,
    user: AuthUser = null
  ) => {
    try {
      const content = this.getContent("warn", logName, message, timestamp);
      await this.traceLogsService.logWarning(logName, content, user?.userId);
      return true;
    } catch (error) {
      console.error("Error logging warning:", error);
      return false;
    }
  };

  error = async (
    logName: string,
    message: string,
    timestamp: Date,
    user: AuthUser = null
  ) => {
    try {
      const content = this.getContent("error", logName, message, timestamp);
      await this.traceLogsService.logError(logName, content, user?.userId);
      return true;
    } catch (error) {
      console.error("Error logging error:", error);
      return false;
    }
  };
}

export default DatabaseLogger;

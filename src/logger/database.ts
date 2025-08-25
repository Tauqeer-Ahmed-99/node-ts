import { ILogger, ILoggerVariants } from ".";
import DatabaseAccessLayer from "../database/access-layer";
import TraceLogsService from "../services/trace-logs-service";
import { AuthUser } from "../types/auth";
import { LoggerUtils } from "./utils";

class DatabaseLogger implements ILogger {
  readonly variant = ILoggerVariants.DATABASE;

  private traceLogsService: TraceLogsService;

  private loggerUtils = new LoggerUtils();

  constructor(database: DatabaseAccessLayer) {
    this.traceLogsService = new TraceLogsService(database);
  }

  info = async (
    logName: string,
    message: string,
    timestamp: Date,
    user: AuthUser = null
  ) => {
    try {
      const content = this.loggerUtils.getContent(
        "info",
        logName,
        message,
        timestamp
      );
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
      const content = this.loggerUtils.getContent(
        "success",
        logName,
        message,
        timestamp
      );
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
      const content = this.loggerUtils.getContent(
        "warn",
        logName,
        message,
        timestamp
      );
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
      const content = this.loggerUtils.getContent(
        "error",
        logName,
        message,
        timestamp
      );
      await this.traceLogsService.logError(logName, content, user?.userId);
      return true;
    } catch (error) {
      console.error("Error logging error:", error);
      return false;
    }
  };
}

export default DatabaseLogger;

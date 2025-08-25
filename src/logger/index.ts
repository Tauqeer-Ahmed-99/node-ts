import { v4 as uuidv4 } from "uuid";
import { AuthUser } from "../types/auth";
import { LoggerUtils } from "./utils";

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

/**
 * Logger class to handle logging to multiple destinations (CLI, file, database).
 * Supports grouping logs by ID and provides utility methods for each log level.
 */
export class Logger {
  // Use private fields for encapsulation
  #loggers: ILogger[];
  #logs: Map<string, LogMessage[]> = new Map();
  #loggerUtils: LoggerUtils;
  user: AuthUser | null;

  /**
   * @param loggers Array of logger implementations
   * @param user Optional AuthUser for context
   */
  constructor(loggers: ILogger[], user: AuthUser | null = null) {
    this.#loggers = loggers;
    this.user = user;
    this.#loggerUtils = new LoggerUtils();
  }

  /**
   * Get loggers matching the specified variants. If none specified, return all.
   */
  public getLoggers(variants: ILoggerVariants[] = []): ILogger[] {
    if (!variants || variants.length === 0) return this.#loggers;
    return this.#loggers.filter((logger) => variants.includes(logger.variant));
  }

  /**
   * Log a message or add to a log group if logId is provided.
   */
  /**
   * Dispatch log to CLI logger(s).
   */
  private async dispatchToCLI(
    logName: string,
    message: string,
    level: LogLevel,
    timestamp: Date
  ): Promise<boolean[]> {
    const cliLoggers = this.#loggers.filter(
      (l) => l.variant === ILoggerVariants.CLI
    );
    return Promise.all(
      cliLoggers.map((logger) =>
        logger[level](logName, message, timestamp, this.user)
      )
    );
  }

  /**
   * Dispatch log to FILE logger(s).
   */
  private async dispatchToFile(
    logName: string,
    message: string,
    level: LogLevel,
    timestamp: Date
  ): Promise<boolean[]> {
    const fileLoggers = this.#loggers.filter(
      (l) => l.variant === ILoggerVariants.FILE
    );
    return Promise.all(
      fileLoggers.map((logger) =>
        logger[level](logName, message, timestamp, this.user)
      )
    );
  }

  /**
   * Dispatch log to DATABASE logger(s).
   */
  private async dispatchToDatabase(
    logName: string,
    message: string,
    level: LogLevel,
    timestamp: Date
  ): Promise<boolean[]> {
    const dbLoggers = this.#loggers.filter(
      (l) => l.variant === ILoggerVariants.DATABASE
    );
    return Promise.all(
      dbLoggers.map((logger) =>
        logger[level](logName, message, timestamp, this.user)
      )
    );
  }

  /**
   * Main log method, delegates to dispatcher(s) based on variants.
   */
  private async log(
    logName: string,
    message: string,
    level: LogLevel,
    variants: ILoggerVariants[] = [],
    logId?: string
  ): Promise<boolean> {
    const timestamp = new Date();

    if (logId) {
      const group = this.#logs.get(logId);
      if (group) {
        group.push({ id: logId, level, logName, message, timestamp });
        return true;
      } else {
        console.error(`[Logger] Log group with id not found: ${logId}`);
        return false;
      }
    }

    // If no variants specified, dispatch to all
    const useVariants =
      variants && variants.length > 0
        ? variants
        : Object.values(ILoggerVariants);
    try {
      const results: boolean[][] = await Promise.all(
        useVariants.map(async (variant) => {
          switch (variant) {
            case ILoggerVariants.CLI:
              return this.dispatchToCLI(logName, message, level, timestamp);
            case ILoggerVariants.FILE:
              return this.dispatchToFile(logName, message, level, timestamp);
            case ILoggerVariants.DATABASE:
              return this.dispatchToDatabase(
                logName,
                message,
                level,
                timestamp
              );
            default:
              return [];
          }
        })
      );
      // Flatten and check if all succeeded
      return results.flat().every(Boolean);
    } catch (err) {
      console.error(`[Logger] Error logging message:`, err);
      return false;
    }
  }

  /**
   * Start a new log group and return its ID.
   */
  start(): string {
    const id = uuidv4();
    this.#logs.set(id, []);
    return id;
  }

  /**
   * End a log group, flush its logs, and remove it from memory.
   */
  async end(logId: string): Promise<boolean> {
    const logs = this.#logs.get(logId);
    if (!logs) {
      console.error(`[Logger] Log group with id not found: ${logId}`);
      return false;
    }

    const content = logs
      .map((log) =>
        this.#loggerUtils.getContent(
          log.level,
          log.logName,
          log.message,
          log.timestamp,
          this.user
        )
      )
      .join("\n");

    const endContent = this.#loggerUtils.getContent(
      "info",
      `End LogId: ${logId}`,
      "Log group End.",
      new Date(),
      this.user
    );

    const result = await this.log(
      `LogId: ${logId}`,
      `\n${content}\n${endContent}`,
      "info",
      []
    );
    this.#logs.delete(logId);
    return result;
  }

  /**
   * Log an info message.
   */
  info(
    logName: string,
    message: string,
    variants: ILoggerVariants[] = [],
    logId?: string
  ): Promise<boolean> {
    return this.log(logName, message, "info", variants, logId);
  }

  /**
   * Log a success message.
   */
  success(
    logName: string,
    message: string,
    variants: ILoggerVariants[] = [],
    logId?: string
  ): Promise<boolean> {
    return this.log(logName, message, "success", variants, logId);
  }

  /**
   * Log a warning message.
   */
  warn(
    logName: string,
    message: string,
    variants: ILoggerVariants[] = [],
    logId?: string
  ): Promise<boolean> {
    return this.log(logName, message, "warn", variants, logId);
  }

  /**
   * Log an error message.
   */
  error(
    logName: string,
    message: string,
    variants: ILoggerVariants[] = [],
    logId?: string
  ): Promise<boolean> {
    return this.log(logName, message, "error", variants, logId);
  }
}

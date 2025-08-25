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
  #logs: Map<string, { log: LogMessage; user: AuthUser | null }[]> = new Map();
  #loggerUtils: LoggerUtils;

  /**
   * @param loggers Array of logger implementations
   */
  constructor(loggers: ILogger[]) {
    this.#loggers = loggers;
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
    timestamp: Date,
    user: AuthUser | null
  ): Promise<boolean[]> {
    const cliLoggers = this.#loggers.filter(
      (l) => l.variant === ILoggerVariants.CLI
    );
    return Promise.all(
      cliLoggers.map((logger) =>
        logger[level](logName, message, timestamp, user)
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
    timestamp: Date,
    user: AuthUser | null
  ): Promise<boolean[]> {
    const fileLoggers = this.#loggers.filter(
      (l) => l.variant === ILoggerVariants.FILE
    );
    return Promise.all(
      fileLoggers.map((logger) =>
        logger[level](logName, message, timestamp, user)
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
    timestamp: Date,
    user: AuthUser | null
  ): Promise<boolean[]> {
    const dbLoggers = this.#loggers.filter(
      (l) => l.variant === ILoggerVariants.DATABASE
    );
    return Promise.all(
      dbLoggers.map((logger) =>
        logger[level](logName, message, timestamp, user)
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
    user: AuthUser | null,
    variants: ILoggerVariants[] = [],
    logId?: string
  ): Promise<boolean> {
    const timestamp = new Date();

    if (logId) {
      const group = this.#logs.get(logId);
      if (group) {
        group.push({
          log: { id: logId, level, logName, message, timestamp },
          user,
        });
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
              return this.dispatchToCLI(
                logName,
                message,
                level,
                timestamp,
                user
              );
            case ILoggerVariants.FILE:
              return this.dispatchToFile(
                logName,
                message,
                level,
                timestamp,
                user
              );
            case ILoggerVariants.DATABASE:
              return this.dispatchToDatabase(
                logName,
                message,
                level,
                timestamp,
                user
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

    // Use the user from the last log in the group, or null if none
    const lastUser = logs.length > 0 ? logs[logs.length - 1].user : null;

    const content = logs
      .map(({ log, user }) =>
        this.#loggerUtils.getContent(
          log.level,
          log.logName,
          log.message,
          log.timestamp,
          user
        )
      )
      .join("\n");

    const endContent = this.#loggerUtils.getContent(
      "info",
      `End LogId: ${logId}`,
      "Log group End.",
      new Date(),
      lastUser
    );

    const result = await this.log(
      `LogId: ${logId}`,
      `\n${content}\n${endContent}`,
      "info",
      lastUser,
      []
    );
    this.#logs.delete(logId);
    return result;
  }

  /**
   * Log an info message.
   * @param params - Log parameters object
   * @param params.logName - Name/category of the log
   * @param params.message - Log message content
   * @param params.user - User context (can be null)
   * @param params.variants - (Optional) Array of logger variants to log to
   * @param params.logId - (Optional) Group log ID for grouped logging
   */
  info({
    logName,
    message,
    user,
    variants = [],
    logId,
  }: {
    logName: string;
    message: string;
    user?: AuthUser;
    variants?: ILoggerVariants[];
    logId?: string;
  }): Promise<boolean> {
    return this.log(logName, message, "info", user ?? null, variants, logId);
  }

  /**
   * Log a success message.
   * @param params - Log parameters object
   * @param params.logName - Name/category of the log
   * @param params.message - Log message content
   * @param params.user - User context (can be null)
   * @param params.variants - (Optional) Array of logger variants to log to
   * @param params.logId - (Optional) Group log ID for grouped logging
   */
  success({
    logName,
    message,
    user,
    variants = [],
    logId,
  }: {
    logName: string;
    message: string;
    user: AuthUser | null;
    variants?: ILoggerVariants[];
    logId?: string;
  }): Promise<boolean> {
    return this.log(logName, message, "success", user ?? null, variants, logId);
  }

  /**
   * Log a warning message.
   * @param params - Log parameters object
   * @param params.logName - Name/category of the log
   * @param params.message - Log message content
   * @param params.user - User context (can be null)
   * @param params.variants - (Optional) Array of logger variants to log to
   * @param params.logId - (Optional) Group log ID for grouped logging
   */
  warn({
    logName,
    message,
    user,
    variants = [],
    logId,
  }: {
    logName: string;
    message: string;
    user?: AuthUser;
    variants?: ILoggerVariants[];
    logId?: string;
  }): Promise<boolean> {
    return this.log(logName, message, "warn", user ?? null, variants, logId);
  }

  /**
   * Log an error message.
   * @param params - Log parameters object
   * @param params.logName - Name/category of the log
   * @param params.message - Log message content
   * @param params.user - User context (can be null)
   * @param params.variants - (Optional) Array of logger variants to log to
   * @param params.logId - (Optional) Group log ID for grouped logging
   */
  error({
    logName,
    message,
    user,
    variants = [],
    logId,
  }: {
    logName: string;
    message: string;
    user?: AuthUser;
    variants?: ILoggerVariants[];
    logId?: string;
  }): Promise<boolean> {
    return this.log(logName, message, "error", user ?? null, variants, logId);
  }
}

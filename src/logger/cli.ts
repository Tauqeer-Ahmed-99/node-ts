import chalk from "chalk";
import { ILogger, ILoggerVariants } from ".";
import { AuthUser } from "../types/auth";

class CLILogger implements ILogger {
  variant = ILoggerVariants.CLI;

  private readonly log = console.log;

  info = (
    logName: string,
    message: string,
    timestamp: Date,
    user: AuthUser = null
  ): Promise<boolean> => {
    this.log(
      chalk.bgBlue("[INFO]"),
      chalk.blue(
        ` [${timestamp.toISOString()}] [${logName}] ${
          user ? `[Requested By: ${user.userId}]` : ""
        } ${message}`
      )
    );
    return new Promise((resolve) => {
      resolve(true);
    });
  };

  success = (
    logName: string,
    message: string,
    timestamp: Date,
    user: AuthUser = null
  ): Promise<boolean> => {
    this.log(
      chalk.bgGreen("[SUCCESS]"),
      chalk.green(` [Requested By: ${user?.userId}]`),
      chalk.green(` [${logName}] [${timestamp.toISOString()}] ${message}`)
    );
    return new Promise((resolve) => {
      resolve(true);
    });
  };

  warn = (
    logName: string,
    message: string,
    timestamp: Date,
    user: AuthUser = null
  ): Promise<boolean> => {
    this.log(
      chalk.bgYellow("[WARN]"),
      chalk.green(` [Requested By: ${user?.userId}]`),
      chalk.yellow(` [${logName}] [${timestamp.toISOString()}] ${message}`)
    );
    return new Promise((resolve) => {
      resolve(true);
    });
  };

  error = (
    logName: string,
    message: string,
    timestamp: Date,
    user: AuthUser = null
  ): Promise<boolean> => {
    this.log(
      chalk.bgRed("[ERROR]"),
      chalk.green(` [Requested By: ${user?.userId}]`),
      chalk.red(` [${logName}] [${timestamp.toISOString()}] ${message}`)
    );
    return new Promise((resolve) => {
      resolve(true);
    });
  };
}

export default CLILogger;

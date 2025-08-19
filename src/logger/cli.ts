import chalk from "chalk";
import { ILogger, ILoggerVariants } from ".";

class CLILogger implements ILogger {
  variant = ILoggerVariants.CLI;

  private readonly log = console.log;

  info = (message: string): Promise<boolean> => {
    this.log(chalk.bgBlue("[INFO]"), chalk.blue(` ${message}`));
    return new Promise((resolve) => {
      resolve(true);
    });
  };

  warn = (message: string): Promise<boolean> => {
    this.log(chalk.bgYellow("[WARN]"), chalk.yellow(` ${message}`));
    return new Promise((resolve) => {
      resolve(true);
    });
  };

  error = (message: string): Promise<boolean> => {
    this.log(chalk.bgRed("[ERROR]"), chalk.red(` ${message}`));
    return new Promise((resolve) => {
      resolve(true);
    });
  };
}

export default CLILogger;

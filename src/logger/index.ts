export enum ILoggerVariants {
  CLI = "cli",
  FILE = "file",
  DATABASE = "database",
}

export interface ILogger {
  variant: ILoggerVariants;

  info: (message: string, variants?: ILoggerVariants[]) => Promise<boolean>;
  warn: (message: string, variants?: ILoggerVariants[]) => Promise<boolean>;
  error: (message: string, variants?: ILoggerVariants[]) => Promise<boolean>;
}

type GlobalLogger = Omit<ILogger, "variant"> & {
  loggers: ILogger[];
};

class Logger implements GlobalLogger {
  loggers: ILogger[];

  info: (message: string, variants?: ILoggerVariants[]) => Promise<boolean>;
  warn: (message: string, variants?: ILoggerVariants[]) => Promise<boolean>;
  error: (message: string, variants?: ILoggerVariants[]) => Promise<boolean>;

  getLoggers = (variants: ILoggerVariants[]) => {
    return this.loggers.filter((logger) =>
      variants.length > 0 ? variants.includes(logger.variant) : true
    );
  };

  log = async (
    message: string,
    type: "info" | "warn" | "error",
    variants: ILoggerVariants[]
  ) => {
    return Promise.all(
      this.getLoggers(variants).map((logger) => logger[type](message))
    )
      .then(() => true)
      .catch(() => false);
  };

  constructor(loggers: ILogger[]) {
    this.loggers = loggers;

    this.info = (message: string, variants: ILoggerVariants[] = []) =>
      this.log(message, "info", variants);

    this.warn = (message: string, variants: ILoggerVariants[] = []) =>
      this.log(message, "warn", variants);

    this.error = (message: string, variants: ILoggerVariants[] = []) =>
      this.log(message, "error", variants);
  }
}

export default Logger;

import "dotenv/config";
import Logger, { ILoggerVariants } from "../logger";

enum EnvVars {
  PORT = "PORT",
  NODE_ENV = "NODE_ENV",
}

class ENV {
  private readonly logger: Logger;

  readonly variables: { [key in EnvVars]: string } = Object.fromEntries(
    Object.values(EnvVars).map((key) => [key, ""])
  ) as { [key in EnvVars]: string };

  constructor(logger: Logger) {
    this.logger = logger;
    this.loadEnv();
  }

  private async loadEnv() {
    const varsNotIncluded: string[] = [];

    for (const key of Object.values(EnvVars)) {
      const value = process.env[key];

      if (!value) {
        varsNotIncluded.push(key);
        continue;
      }

      this.variables[key] = value;
    }

    if (varsNotIncluded.length > 0) {
      await this.logger.info("All required environment variables are set.", [
        ILoggerVariants.CLI,
      ]);

      process.exit(1);
    }
  }
}

export default ENV;

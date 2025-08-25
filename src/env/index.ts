import "dotenv/config";
import { Logger, ILoggerVariants } from "../logger";

enum EnvVars {
  PORT = "PORT",
  NODE_ENV = "NODE_ENV",
  WORKOS_AUTHKIT_CLIENT_KEY = "WORKOS_AUTHKIT_CLIENT_KEY",
  WORKOS_AUTHKIT_SECRET_KEY = "WORKOS_AUTHKIT_SECRET_KEY",
  DATABASE_URL = "DATABASE_URL",
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
      await this.logger.error({
        logName: "ENV",
        message: `${
          varsNotIncluded.length
        } Environment variable(s) ${varsNotIncluded.join(", ")} are not set.`,
        user: null,
        variants: [ILoggerVariants.CLI],
      });

      process.exit(1);
    }

    await this.logger.info({
      logName: "ENV",
      message: "All required environment variables are set.",
      user: null,
      variants: [ILoggerVariants.CLI],
    });
  }
}

export default ENV;

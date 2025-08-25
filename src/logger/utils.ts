import { LogLevel } from ".";
import { AuthUser } from "../types/auth";

export class LoggerUtils {
  getContent = (
    level: LogLevel,
    logName: string,
    message: string,
    timestamp: Date,
    user: AuthUser = null
  ) => {
    // const content = `${chalk.bgBlue(`[${level.toUpperCase()}]`)} ${chalk.blue(
    //   ` [${timestamp.toISOString()}] ${
    //     user ? `[Requested By: ${user.userId}]` : ""
    //   }[${logName}] ${message}`
    // )}`;

    const contentWithoutChalk = `[${level.toUpperCase()}]  [${timestamp.toISOString()}]${
      user ? ` [Requested By: ${user.userId}]` : ""
    } [${logName}] ${message}`;

    return contentWithoutChalk;
  };
}

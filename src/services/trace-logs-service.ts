import { Service } from ".";
import DatabaseAccessLayer from "../database/access-layer";

class TraceLogsService implements Omit<Service, "logger"> {
  readonly database: DatabaseAccessLayer;

  constructor(database: DatabaseAccessLayer) {
    this.database = database;
  }

  logInfo(logName: string, content: string, createdBy?: string) {
    return this.database.traceLogsDAL.logInfo(logName, content, createdBy);
  }

  logSuccess(logName: string, content: string, createdBy?: string) {
    return this.database.traceLogsDAL.logSuccess(logName, content, createdBy);
  }

  logWarning(logName: string, content: string, createdBy?: string) {
    return this.database.traceLogsDAL.logWarning(logName, content, createdBy);
  }

  logError(logName: string, content: string, createdBy?: string) {
    return this.database.traceLogsDAL.logError(logName, content, createdBy);
  }
}

export default TraceLogsService;

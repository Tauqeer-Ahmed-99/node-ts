import { Database } from "..";
import { TraceLogs } from "../schema";

class TraceLogsDAL {
  readonly database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  logInfo(logName: string, content: string, createdby?: string) {
    return this.database.insert(TraceLogs).values({
      traceLogType: "info",
      traceLogName: logName,
      content,
      requestInitiator: createdby,
      createdBy: createdby ?? "System",
      modifiedBy: createdby,
    });
  }

  logSuccess(logName: string, content: string, createdby?: string) {
    return this.database.insert(TraceLogs).values({
      traceLogType: "success",
      traceLogName: logName,
      content,
      requestInitiator: createdby,
      createdBy: createdby ?? "System",
      modifiedBy: createdby,
    });
  }

  logWarning(logName: string, content: string, createdby?: string) {
    return this.database.insert(TraceLogs).values({
      traceLogType: "warn",
      traceLogName: logName,
      content,
      requestInitiator: createdby,
      createdBy: createdby ?? "System",
      modifiedBy: createdby,
    });
  }

  logError(logName: string, content: string, createdby?: string) {
    return this.database.insert(TraceLogs).values({
      traceLogType: "error",
      traceLogName: logName,
      content,
      requestInitiator: createdby,
      createdBy: createdby ?? "System",
      modifiedBy: createdby,
    });
  }
}

export default TraceLogsDAL;

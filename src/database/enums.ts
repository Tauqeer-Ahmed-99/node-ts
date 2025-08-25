import { pgEnum } from "drizzle-orm/pg-core";

export const ResourceStatus = pgEnum("resourceStatus", ["active", "inactive"]);

export const TraceLogType = pgEnum("type", [
  "info",
  "success",
  "warn",
  "error",
]);

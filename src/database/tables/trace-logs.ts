import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { ResourceStatus, TraceLogType } from "../enums";

export const TraceLogs = pgTable("TraceLogs", {
  traceLogId: uuid("traceLogId").defaultRandom().primaryKey(),
  traceLogName: varchar("traceLogName", { length: 255 }).notNull(),
  traceLogType: TraceLogType("traceLogType").notNull(),
  content: text("content").notNull(),
  requestInitiator: varchar("requestInitiator", { length: 255 }),
  resourceStatus: ResourceStatus("resourceStatus").default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  createdBy: varchar("createdBy", { length: 255 }).notNull(),
  modifiedAt: timestamp("modifiedAt")
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
  modifiedBy: varchar("modifiedBy", { length: 255 }),
});

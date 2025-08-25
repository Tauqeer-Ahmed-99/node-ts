import WalletDAL from "./wallet-dal";
import database from "..";
import TraceLogsDAL from "./trace-logs-dal";

class DatabaseAccessLayer {
  readonly database = database;

  readonly traceLogsDAL: TraceLogsDAL;
  readonly walletDAL: WalletDAL;

  constructor() {
    this.traceLogsDAL = new TraceLogsDAL(this.database);
    this.walletDAL = new WalletDAL(this.database);
  }
}

export default DatabaseAccessLayer;

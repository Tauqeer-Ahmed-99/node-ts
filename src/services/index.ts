import DatabaseAccessLayer from "../database/access-layer";
import Logger from "../logger";
import TraceLogsService from "./trace-logs-service";
import WalletService from "./wallet-service";

export interface Service {
  logger: Logger;
  database: DatabaseAccessLayer;
}

class Services {
  private logger: Logger;
  private database: DatabaseAccessLayer;

  readonly traceLogs: TraceLogsService;
  readonly wallet: WalletService;

  constructor(logger: Logger, database: DatabaseAccessLayer) {
    this.logger = logger;
    this.database = database;

    this.traceLogs = new TraceLogsService(this.database);
    this.wallet = new WalletService(this.logger, this.database);
  }
}

export default Services;

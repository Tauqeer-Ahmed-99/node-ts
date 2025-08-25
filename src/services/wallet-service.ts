import { Service } from ".";
import Database from "../database/access-layer";
import { Logger } from "../logger";

class WalletService implements Service {
  readonly logger: Logger;
  readonly database: Database;

  constructor(logger: Logger, database: Database) {
    this.logger = logger;
    this.database = database;
  }

  createWallet(userId: string) {
    // Logic to create a wallet for the user

    this.database.walletDAL.createWallet(userId);
    this.logger;

    // Simulate wallet creation
    return { walletId: `wallet-${userId}`, userId };
  }
}

export default WalletService;

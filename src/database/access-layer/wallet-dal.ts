import { Database } from "..";

class WalletDAL {
  readonly database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  createWallet(userId: string) {
    console.log("Created wallet for user:", userId);
  }
}

export default WalletDAL;

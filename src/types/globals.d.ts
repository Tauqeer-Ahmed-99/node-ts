import { WorkOS } from "@workos-inc/node";
import ENV from "../env";
import { Logger } from "../logger";
import { JwksClient } from "jwks-rsa";
import { AuthUser } from "./auth";
import Services from "../services";

declare global {
  namespace Express {
    interface Request {
      logger: Logger;
      env: ENV;
      workos: WorkOS;
      jwks: JwksClient;
      user: AuthUser;
      services: Services;
    }
  }
}

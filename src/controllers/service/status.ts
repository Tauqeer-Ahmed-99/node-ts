import { Request, Response, NextFunction } from "express";
import APIResponse, { APIStatus } from "../../models/api-response";
import HTTPError, { HTTPStatusCode } from "../../models/http-error";

const serviceStatus = (_req: Request, res: Response, next: NextFunction) => {
  try {
    const response = new APIResponse(
      APIStatus.Success,
      HTTPStatusCode.OK,
      "NodeJS (Typescript (TSX & TSC), Express, WorkOS, Postgres, Env Variables & Loggers) - Service is Running."
    );

    res.status(HTTPStatusCode.OK).json(response);
    return;
  } catch (err) {
    next(HTTPError.fromError(err));
  }
};

export default serviceStatus;

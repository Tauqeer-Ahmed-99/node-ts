import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import APIResponse from "../../models/api-response";
import HTTPError from "../../models/http-error";

const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    const error = HTTPError.fromError(err);

    const response = APIResponse.fromError(error);

    res.status(response.statusCode).send(response);
  } catch (err) {
    const error = HTTPError.fromError(err);

    const response = APIResponse.fromError(error);

    res.status(response.statusCode).send(response);
  }
};

export default errorHandler;

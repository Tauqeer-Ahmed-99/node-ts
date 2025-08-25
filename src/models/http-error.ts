import { APIStatus } from "./api-response";

export enum HTTPStatusCode {
  OK = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  InternalServerError = 500,
}

export enum ErrorCode {
  NotFound = "NotFound",
  InvalidInput = "InvalidInput",
  Unauthorized = "Unauthorized",
  AccessTokenRequired = "AccessTokenRequired",
  AccessTokenExpired = "AccessTokenExpired",
  InternalServerError = "InternalServerError",
}

class HTTPError extends Error {
  status: APIStatus;
  statusCode: HTTPStatusCode;
  errorCode: ErrorCode;

  constructor(
    statusCode: HTTPStatusCode,
    errorCode: ErrorCode,
    message: string
  ) {
    super(message);
    this.name = "HTTPError";
    this.status = APIStatus.Error;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }

  static fromError = (error: unknown): HTTPError => {
    if (error instanceof HTTPError) {
      return error;
    }

    const err = error as Error;

    return new HTTPError(
      HTTPStatusCode.InternalServerError,
      ErrorCode.InternalServerError,
      err.message || err.name || "Internal Server Error"
    );
  };
}

export default HTTPError;

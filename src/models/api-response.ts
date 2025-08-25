import HTTPError, { ErrorCode, HTTPStatusCode } from "./http-error";

export enum APIStatus {
  Success = "Success",
  Error = "Error",
}

class APIResponse<T = null> {
  status: APIStatus;
  statusCode: HTTPStatusCode;
  message: string;
  errorCode?: ErrorCode;
  data: T;

  constructor(
    status: APIStatus,
    statusCode: HTTPStatusCode,
    message: string,
    errorCode?: ErrorCode,
    data: T = null as T
  ) {
    this.status = status;
    this.statusCode = statusCode;
    this.message = message;
    this.errorCode = errorCode;
    this.data = data;
  }

  static fromError = (error: HTTPError) => {
    return new APIResponse(
      APIStatus.Error,
      error.statusCode,
      error.message,
      error.errorCode,
      null
    );
  };
}

export default APIResponse;

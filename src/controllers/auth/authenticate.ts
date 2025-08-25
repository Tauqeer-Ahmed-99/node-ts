import { Request, Response, NextFunction } from "express";
import jwt, {
  GetPublicKeyOrSecret,
  JsonWebTokenError,
  JwtPayload,
  NotBeforeError,
  TokenExpiredError,
} from "jsonwebtoken";
import { Permission } from "../../types/auth";
import APIResponse, { APIStatus } from "../../models/api-response";
import HTTPError, { ErrorCode, HTTPStatusCode } from "../../models/http-error";

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const response: APIResponse = {
        status: APIStatus.Error,
        statusCode: HTTPStatusCode.Unauthorized,
        message: "Access Token Required.",
        errorCode: ErrorCode.AccessTokenRequired,
        data: null,
      };

      res.status(HTTPStatusCode.Unauthorized).json(response);
      return;
    }

    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
      const response: APIResponse = {
        status: APIStatus.Error,
        statusCode: HTTPStatusCode.Unauthorized,
        message: "Access Token Required.",
        errorCode: ErrorCode.AccessTokenRequired,
        data: null,
      };

      res.status(HTTPStatusCode.Unauthorized).json(response);
      return;
    }

    const getKey: GetPublicKeyOrSecret = (header, callback) => {
      req.jwks.getSigningKey(header.kid, (err, key) => {
        if (err) {
          return callback(err);
        }
        const signingKey = key?.getPublicKey();
        callback(null, signingKey);
      });
    };

    const jwtPayload = await new Promise<JwtPayload>((resolve, reject) => {
      jwt.verify(accessToken, getKey, async (err, decoded) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(decoded as jwt.JwtPayload);
        }
      });
    });

    const now = Math.floor(Date.now() / 1000); // Converted in to seconds

    const userId = jwtPayload.sub as string;
    const sessionId = jwtPayload.sid as string;
    const orgId = jwtPayload.org_id as string;
    const role = jwtPayload.role as string;
    const permissions: Permission[] = jwtPayload.permissions || [];
    const featureFlags: string[] = jwtPayload.feature_flags || [];
    const expiresAt = jwtPayload.exp as number;
    const issuedAt = jwtPayload.iat as number;

    req.user = {
      userId,
      sessionId,
      orgId,
      role,
      permissions,
      featureFlags,
      expiresAt,
      issuedAt,
    };

    if (now > expiresAt) {
      const response: APIResponse = {
        status: APIStatus.Error,
        statusCode: HTTPStatusCode.Unauthorized,
        message: "Access Token Expired.",
        errorCode: ErrorCode.AccessTokenExpired,
        data: null,
      };

      res.status(HTTPStatusCode.Unauthorized).json(response);
      return;
    }

    next();
  } catch (error) {
    if (
      error instanceof JsonWebTokenError ||
      error instanceof TokenExpiredError ||
      error instanceof NotBeforeError
    ) {
      const response: APIResponse = {
        status: APIStatus.Error,
        statusCode: HTTPStatusCode.Unauthorized,
        message: error.message,
        errorCode: ErrorCode.Unauthorized,
        data: null,
      };

      res.status(HTTPStatusCode.Unauthorized).json(response);
      return;
    }

    next(HTTPError.fromError(error));
  }
};

export default authenticate;

import type { NextApiRequest, NextApiResponse } from 'next';
import type { ErrorHandler } from 'next-connect';

export enum ErrorCode {
  /**
   * Something went terribly, terribly wrong
   * @status 500
   */
  never = 1,
  /**
   * GitHub OAuth authorization flow was rejected
   * @status 400
   */
  invalid_auth_code,
  /**
   * GitHub OAuth client credentials are incorrect
   * @status 400
   */
  invalid_auth_secret,
  /**
   * Authentication is required
   * @status 403
   */
  unauthorized,
  /**
   * Invalid access token
   * @status 401
   */
  bad_access_token,
  /**
   * File wasn't uploaded, or was lost to the I/O gods
   * @status 400
   */
  no_file_received,
  /**
   * post not found
   * @status 404
   */
  post_not_found,
}

export function getStatusCode(error: ErrorCode): number {
  switch (error) {
    case ErrorCode.no_file_received:
    case ErrorCode.invalid_auth_code:
    case ErrorCode.invalid_auth_secret:
      return 400;

    case ErrorCode.bad_access_token:
      return 401;

    case ErrorCode.unauthorized:
      return 403;

    case ErrorCode.post_not_found:
      return 404;

    case ErrorCode.never:
    default:
      return 500;
  }
}

export class APIError extends Error {
  constructor(public error: ErrorCode, public message = 'Something went wrong') {
    super(`API Error: ${error}`);
  }
}

export const errorHandler: ErrorHandler<NextApiRequest, NextApiResponse> = (err, req, res) => {
  if (err instanceof APIError) {
    res.status(getStatusCode(err.error)).send({
      error: ErrorCode[err.error],
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(500).send({
      error: err?.toString() || 'server_error',
      message: 'Something broke',
      stack: err?.stack,
    });
  }
};

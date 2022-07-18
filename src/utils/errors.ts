import type { NextApiRequest, NextApiResponse } from 'next';
import type { ErrorHandler } from 'next-connect';

export enum ErrorCode {
  /**
   * Something went terribly, terribly wrong
   * @status 500
   */
  never = 1,

  /**
   * Token failed signature check
   * @status 498
   */
  bad_access_token,

  /**
   * Unable to parse received body
   * @status 406
   */
  body_parsing_failed,

  /**
   * An unknown error from GitHub was received
   * @status 500
   */
  github_error,

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
   * Access token was not received
   * @status 403
   */
  missing_access_token,

  /**
   * File wasn't uploaded, or was lost to the I/O gods
   * @status 422
   */
  no_file_received,

  /**
   * File wasn't uploaded, or was lost to the I/O gods
   * @status 422
   */
  no_path_to_file,

  /**
   * post not found
   * @status 404
   */
  post_not_found,

  /**
   * Token not sent or is expired
   * @status 498
   */
  unauthenticated,

  /**
   * Session lacks required authorization
   * @status 403
   */
  unauthorized,
}

export function getStatusCode(error: ErrorCode): number {
  switch (error) {
    case ErrorCode.invalid_auth_code:
    case ErrorCode.invalid_auth_secret:
      return 400;

    case ErrorCode.missing_access_token:
    case ErrorCode.unauthorized:
    case ErrorCode.unauthenticated:
      return 403;

    case ErrorCode.post_not_found:
      return 404;

    case ErrorCode.body_parsing_failed:
      return 406;

    case ErrorCode.no_file_received:
    case ErrorCode.no_path_to_file:
      return 422;

    case ErrorCode.bad_access_token:
      return 498;

    case ErrorCode.github_error:
      return 503;

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

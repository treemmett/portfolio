import type { NextApiRequest, NextApiResponse } from 'next';
import type { ErrorHandler } from 'next-connect';

export enum ErrorCode {
  /**
   * Something went terribly, terribly wrong
   * @status 500
   */
  never = 1962,

  /**
   * Token failed signature check
   * @status 498
   */
  bad_access_token = 6339,

  /**
   * Upload token failed signature check
   * @status 498
   */
  bad_upload_token = 4271,

  /**
   * An unknown error from GitHub was received
   * @status 500
   */
  github_error = 6535,

  /**
   * GitHub OAuth authorization flow was rejected
   * @status 400
   */
  invalid_auth_code = 4352,

  /**
   * GitHub OAuth client credentials are incorrect
   * @status 400
   */
  invalid_auth_secret = 7393,

  /**
   * Access token was not received
   * @status 403
   */
  missing_access_token = 8588,

  /**
   * File wasn't uploaded, or was lost to the I/O gods
   * @status 422
   */
  no_file_received = 1245,

  /**
   * No upload token was received
   * @status 422
   */
  no_upload_token = 1642,

  /**
   * post not found
   * @status 404
   */
  post_not_found = 9223,

  /**
   * Token not sent or is expired
   * @status 498
   */
  unauthenticated = 6208,

  /**
   * Session lacks required authorization
   * @status 403
   */
  unauthorized = 1601,
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
    case ErrorCode.no_file_received:
      return 404;

    case ErrorCode.no_upload_token:
      return 422;

    case ErrorCode.bad_access_token:
    case ErrorCode.bad_upload_token:
      return 498;

    case ErrorCode.github_error:
      return 503;

    case ErrorCode.never:
    default:
      return 500;
  }
}

export function getErrorMessage(error: ErrorCode): string {
  switch (error) {
    case ErrorCode.bad_access_token:
      return 'Invalid access token';

    case ErrorCode.bad_upload_token:
      return 'Invalid upload token';

    case ErrorCode.no_file_received:
      return 'File not found';

    case ErrorCode.no_upload_token:
      return 'No upload token';

    case ErrorCode.post_not_found:
      return 'Post not found';

    case ErrorCode.unauthenticated:
      return 'Unauthenticated request';

    case ErrorCode.unauthorized:
      return 'Missing required authorization scopes';

    case ErrorCode.never:
    default:
      return 'Something went wrong';
  }
}

export class APIError extends Error {
  constructor(public error: ErrorCode) {
    super(`API Error: ${error}`);
  }
}

export const errorHandler: ErrorHandler<NextApiRequest, NextApiResponse> = (err, req, res) => {
  const errorCode = err.error || ErrorCode.never;

  res.status(getStatusCode(errorCode)).send({
    error: {
      code: errorCode,
      message: getErrorMessage(errorCode),
      stack: err.stack,
    },
  });
};

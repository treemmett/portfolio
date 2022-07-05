import type { NextApiRequest, NextApiResponse } from 'next';
import type { ErrorHandler } from 'next-connect';

export enum ErrorCode {
  /**
   * Something went terribly, terribly wrong
   */
  never = 1,
  /**
   * GitHub OAuth authorization flow was rejected
   */
  invalid_auth_code,
  /**
   * GitHub OAuth client credentials are incorrect
   */
  invalid_auth_secret,
  /**
   * Authentication is required
   */
  unauthorized,
  /**
   * Invalid access token
   */
  bad_access_token,
  /**
   * Mime type isn't supported
   */
  unsupported_mime,
  /**
   * File wasn't uploaded, or was lost to the I/O gods
   */
  no_file_received,
}

export class APIError extends Error {
  constructor(
    public error: ErrorCode,
    public status = 500,
    public message = 'Something went wrong'
  ) {
    super(`API Error: ${error}`);
  }
}

export const errorHandler: ErrorHandler<NextApiRequest, NextApiResponse> = (err, req, res) => {
  if (err instanceof APIError) {
    res.status(err.status).send({
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

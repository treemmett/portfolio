import type { NextApiRequest, NextApiResponse } from 'next';
import type { ErrorHandler } from 'next-connect';

export enum ErrorCode {
  /**
   * Something went terribly, terribly wrong
   */
  never,
  /**
   * GitHub OAuth authorization rejected
   */
  invalid_auth_code,
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
      error: err.error,
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

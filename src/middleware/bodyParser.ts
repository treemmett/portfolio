import { json, text } from 'body-parser';
import formidable, { File } from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';
import { Middleware } from 'next-connect';
import { APIError, ErrorCode } from '../utils/errors';
import { logger } from '../utils/logger';

type Files = { [file: string]: File };

export interface ParsedApiRequest extends NextApiRequest {
  files?: Files;
}

export const bodyParser: Middleware<ParsedApiRequest, NextApiResponse> = (req, res, next) => {
  logger.info('Initializing body parser');
  if (!req.url.startsWith('/api/post')) {
    logger.info('Skipping parser');
    next();
    return;
  }

  try {
    switch (req.headers['content-type']?.split(';')[0]) {
      case 'application/json':
        logger.info('Parsing JSON');
        json()(req, res, next);
        break;

      case 'multipart/form-data':
        logger.info('Parsing form-data');
        formidable().parse(req, (err, fields, files) => {
          if (err) {
            logger.error('An error occurred while parsing form-data', { err });
            next(err);
            return;
          }

          req.body = fields;
          req.files = files as Files;
          next();
        });
        break;

      default: {
        logger.info('Parsing text');
        text()(req, res, next);
      }
    }
  } catch (err) {
    logger.error('An error occurred during parsing', { err });
    throw new APIError(ErrorCode.body_parsing_failed);
  }
};

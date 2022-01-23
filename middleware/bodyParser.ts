import { json, text } from 'body-parser';
import formidable, { File } from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';
import { Middleware } from 'next-connect';

type Files = { [file: string]: File };

export interface ParsedApiRequest extends NextApiRequest {
  files: Files;
}

export const bodyParser: Middleware<ParsedApiRequest, NextApiResponse> = (req, res, next) => {
  switch (req.headers['content-type'].split(';')[0]) {
    case 'application/json':
      json()(req, res, next);
      break;

    case 'multipart/form-data':
      formidable().parse(req, (err, fields, files) => {
        if (err) return next(err);

        req.body = fields;
        req.files = files as Files;
        return next();
      });
      break;

    default:
      text()(req, res, next);
  }
};

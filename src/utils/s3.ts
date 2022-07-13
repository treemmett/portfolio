import { Credentials, Endpoint, S3 } from 'aws-sdk';
import { Config } from './config';

const { S3_KEY, S3_KEY_SECRET, S3_URL } = Config;

export const s3 = new S3({
  credentials: new Credentials({
    accessKeyId: S3_KEY,
    secretAccessKey: S3_KEY_SECRET,
  }),
  endpoint: new Endpoint(S3_URL),
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

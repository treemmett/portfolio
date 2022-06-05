export class Config {
  public static AUTHORIZED_USERS = process.env.AUTHORIZED_USERS || '';

  public static CDN_URL?: string = process.env.CDN_URL;

  public static DB_CERT?: string = process.env.DB_CERT;

  public static DB_DATABASE = process.env.DB_DATABASE || 'blog';

  public static DB_HOST = process.env.DB_HOST || 'localhost';

  public static DB_PASS?: string = process.env.DB_PASS;

  public static DB_PORT = process.env.DB_PORT || '5432';

  public static DB_USER?: string = process.env.DB_USER;

  public static GITHUB_CLIENT_SECRET =
    process.env.GITHUB_CLIENT_SECRET || 'e99aafe5c56d915c5b07d38e2aaa393bf6764218';

  public static JWT_SECRET = process.env.JWT_SECRET || 'hello';

  public static NEXT_PUBLIC_GITHUB_CLIENT_ID =
    process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'd82ea0a4e4fd1625b0b8';

  public static NEXT_PUBLIC_NAME = process.env.NEXT_PUBLIC_NAME || 'Hello World';

  public static NODE_ENV = process.env.NODE_ENV || 'development';

  public static S3_BUCKET = process.env.S3_BUCKET || 'blog';

  public static S3_KEY = process.env.S3_KEY || 'minio';

  public static S3_KEY_SECRET = process.env.S3_KEY_SECRET || 'password';

  public static S3_URL = process.env.S3_URL || 'http://127.0.0.1:9000';
}

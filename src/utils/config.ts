export class Config {
  public static AUTHORIZED_USERS = process.env.AUTHORIZED_USERS || '';

  public static CDN_URL?: string = process.env.CDN_URL;

  public static GITHUB_CLIENT_SECRET?: string = process.env.GITHUB_CLIENT_SECRET;

  public static JWT_SECRET = process.env.JWT_SECRET || 'hello';

  public static NEXT_PUBLIC_GITHUB_CLIENT_ID?: string = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

  public static NEXT_PUBLIC_GITHUB_USERNAME?: string = process.env.NEXT_PUBLIC_GITHUB_USERNAME;

  public static NEXT_PUBLIC_INSTAGRAM_USERNAME?: string =
    process.env.NEXT_PUBLIC_INSTAGRAM_USERNAME;

  public static NEXT_PUBLIC_LINKEDIN_USERNAME?: string = process.env.NEXT_PUBLIC_LINKEDIN_USERNAME;

  public static NEXT_PUBLIC_MAPBOX_TOKEN?: string = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  public static NEXT_PUBLIC_NAME = process.env.NEXT_PUBLIC_NAME || 'Hello World';

  public static NODE_ENV = process.env.NODE_ENV || 'development';

  public static S3_BUCKET = process.env.S3_BUCKET || 'blog';

  public static S3_KEY = process.env.S3_KEY || 'minio';

  public static S3_KEY_SECRET = process.env.S3_KEY_SECRET || 'password';

  public static S3_URL = process.env.S3_URL || 'http://127.0.0.1:9000';
}

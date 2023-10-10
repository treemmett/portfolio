export class Config {
  public static BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN as string;

  public static CDN_URL?: string = process.env.CDN_URL;

  public static DEFAULT_USER = process.env.DEFAULT_USER || 'tregan';

  public static GITHUB_CLIENT_SECRET?: string = process.env.GITHUB_CLIENT_SECRET;

  public static GEOLOCATION_KEY = process.env.GEOLOCATION_KEY;

  public static JWT_SECRET = process.env.JWT_SECRET || 'hello';

  public static NEXT_PUBLIC_GITHUB_CLIENT_ID: string = process.env
    .NEXT_PUBLIC_GITHUB_CLIENT_ID as string;

  public static NEXT_PUBLIC_MAPBOX_TOKEN?: string = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  public static NODE_ENV = process.env.NODE_ENV || 'development';

  public static S3_BUCKET = process.env.S3_BUCKET || 'blog';

  public static S3_KEY = process.env.S3_KEY || 'minio';

  public static S3_KEY_SECRET = process.env.S3_KEY_SECRET || 'password';

  public static S3_URL = process.env.S3_URL || 'http://127.0.0.1:9000';
}

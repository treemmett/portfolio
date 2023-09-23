export class Config {
  public static AXIOM_TOKEN = process.env.AXIOM_TOKEN;

  public static CDN_URL?: string = process.env.CDN_URL;

  public static DB_CERTIFICATE = process.env.DB_CERTIFICATE;

  public static DB_DATABASE = process.env.DB_DATABASE || 'daguerrio';

  public static DB_HOST = process.env.DB_HOST || 'localhost';

  public static DB_PASSWORD = process.env.DB_PASSWORD;

  public static DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;

  public static DB_USERNAME = process.env.DB_USERNAME;

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

import { transformAndValidate } from 'class-transformer-validator';
import { IsDate, IsEnum, IsNumber, IsString } from 'class-validator';
import { ulid } from 'ulid';
import { Country } from '../lib/countryCodes';
import { Config } from '../utils/config';
import { logger } from '../utils/logger';
import { s3 } from '../utils/s3';

const { S3_BUCKET } = Config;

const MARKERS_FILE_KEY = '_markers.json';

export class Marker {
  @IsEnum(Country)
  public country: Country;

  @IsString()
  public city: string;

  @IsDate()
  public date: Date;

  @IsString()
  public id: string;

  @IsNumber()
  public lat: number;

  @IsNumber()
  public lng: number;

  public static async checkIn(
    lng: number,
    lat: number,
    date: Date,
    country: Country,
    city: string
  ): Promise<Marker> {
    const marker = await transformAndValidate(Marker, {
      city,
      country,
      date,
      id: ulid(),
      lat,
      lng,
    });

    const markers = await this.getAll();
    markers.unshift(marker);
    await this.writeIndex(markers);
    return marker;
  }

  public static async getAll(): Promise<Marker[]> {
    try {
      logger.info('Looking up markers index');
      const { Body } = await s3
        .getObject({
          Bucket: S3_BUCKET,
          Key: MARKERS_FILE_KEY,
        })
        .promise();

      const json = Body.toString();

      logger.info('Marker data found', { json });

      return JSON.parse(json);
    } catch (err) {
      if (err?.code === 'NoSuchKey') {
        return [];
      }

      throw err;
    }
  }

  private static async writeIndex(markers: Marker[]): Promise<void> {
    logger.info('Writing markers index', { markers });
    await s3
      .upload({
        ACL: 'public-read',
        Body: JSON.stringify(markers),
        Bucket: S3_BUCKET,
        ContentType: 'application/json',
        Key: MARKERS_FILE_KEY,
      })
      .promise();
  }
}

import { transformAndValidate } from 'class-transformer-validator';
import { IsDate, IsEnum, IsNumber, IsString } from 'class-validator';
import { ulid } from 'ulid';
import { Country } from '@lib/countryCodes';
import { Config } from '@utils/config';
import { APIError, ErrorCode } from '@utils/errors';
import { logger } from '@utils/logger';
import { s3 } from '@utils/s3';

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

  @IsDate()
  public updated: Date;

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
      date: new Date(date),
      id: ulid(),
      lat,
      lng,
      updated: new Date(),
    });

    const markers = await this.getAll();
    markers.unshift(marker);
    await this.writeIndex(markers);
    return marker;
  }

  public static async delete(id: string): Promise<void> {
    logger.info('Deleting marker', { id });
    const markers = await this.getAll();

    const index = markers.findIndex((p) => p.id === id);

    if (!~index) {
      logger.error('marker not found', { id, index });
      throw new APIError(ErrorCode.marker_not_found);
    }

    markers.splice(index, 1);

    await this.writeIndex(markers);
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

      logger.info('Marker data found');

      return JSON.parse(json);
    } catch (err) {
      if (err?.code === 'NoSuchKey') {
        return [];
      }

      throw err;
    }
  }

  public static async update(
    id: string,
    data: Partial<Pick<Marker, 'city' | 'country' | 'date' | 'lat' | 'lng'>>
  ): Promise<Marker> {
    logger.info('Updating marker', { data, id });
    const markers = await this.getAll();

    const index = markers.findIndex((p) => p.id === id);

    if (!~index) {
      logger.error('No marker index found', { id, index });
      throw new APIError(ErrorCode.marker_not_found);
    }

    const [marker] = markers.splice(index, 1);

    if (!marker) {
      logger.error('No marker found', { id, index, marker });
      throw new APIError(ErrorCode.marker_not_found);
    }

    logger.info('Marker found', { data, id, marker });

    if (data.city) {
      marker.city = data.city;
    }
    if (data.country) {
      marker.country = data.country;
    }
    if (data.date) {
      marker.date = data.date;
    }
    if (data.lat) {
      marker.lat = data.lat;
    }
    if (data.lng) {
      marker.lng = data.lng;
    }

    marker.updated = new Date();

    logger.info('Writing updated marker', { marker });

    markers.unshift(marker);
    await this.writeIndex(markers);
    return marker;
  }

  private static async writeIndex(markers: Marker[]): Promise<void> {
    logger.info('Writing markers index', { markers });
    await s3
      .upload({
        ACL: 'public-read',
        Body: JSON.stringify(
          markers.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        ),
        Bucket: S3_BUCKET,
        ContentType: 'application/json',
        Key: MARKERS_FILE_KEY,
      })
      .promise();
  }
}

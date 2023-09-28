'use server';

import { Prisma } from '@prisma/client';
import { AWSError } from 'aws-sdk';
import { GetObjectOutput } from 'aws-sdk/clients/s3';
import { PromiseResult } from 'aws-sdk/lib/request';
import { parse as parseExif } from 'exifr';
import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import { revalidatePath } from 'next/cache';
import sharp from 'sharp';
import { v4 } from 'uuid';
import { getUser } from '@app/getUser';
import { AuthorizationScopes } from '@app/scopes';
import { PhotoType } from '@entities/PhotoType';
import { geocode } from '@lib/geocode';
import { Config } from '@utils/config';
import { BadUploadTokenError, NoFileReceivedError, UnauthorizedError } from '@utils/errors';
import { logger } from '@utils/logger';
import { prisma } from '@utils/prisma';
import { s3 } from '@utils/s3';

export async function getUploadToken() {
  const user = await getUser(AuthorizationScopes.post);
  logger.trace('Creating upload token');
  const id = v4();

  const [token, url] = await Promise.all([
    new SignJWT({ type: PhotoType.ORIGINAL })
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(id)
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime('3m')
      .sign(new TextEncoder().encode(Config.JWT_SECRET)),
    s3.getSignedUrlPromise('putObject', {
      Bucket: Config.S3_BUCKET,
      Expires: 60 * 2,
      Key: `processing/${id}`,
    }),
  ]);

  return { token, url };
}

export async function processPhoto(token: string) {
  const user = await getUser(AuthorizationScopes.post);

  logger.trace({ token, user }, 'Processing upload');

  if (!token) {
    logger.error('No upload token', { token });
    throw new BadUploadTokenError('No upload token');
  }

  let payload: JWTPayload & { type: PhotoType };

  try {
    const verification = await jwtVerify(token, new TextEncoder().encode(Config.JWT_SECRET), {
      clockTolerance: '1 minute',
    });

    payload = verification.payload as typeof payload;
  } catch {
    throw new BadUploadTokenError();
  }

  if (payload.sub !== user.id) {
    throw new UnauthorizedError('Invalid token subject');
  }

  const { jti } = payload as {
    jti: string;
  };

  let object: PromiseResult<GetObjectOutput, AWSError>;
  try {
    object = await s3
      .getObject({
        Bucket: Config.S3_BUCKET,
        Key: `processing/${jti}`,
      })
      .promise();
  } catch (e) {
    if ((e as AWSError).code === 'NoSuchKey') {
      throw new NoFileReceivedError();
    }

    throw e;
  }

  if (!object.Body) throw new NoFileReceivedError();

  logger.trace({ key: `processing/${jti}` }, 'Loading object');

  await s3.deleteObject({ Bucket: Config.S3_BUCKET, Key: `processing/${jti}` }).promise();

  const uploadedPhoto = object.Body as Buffer;

  logger.trace('Object loaded');

  const image = sharp(uploadedPhoto);

  image.rotate().webp().sharpen({ m2: 2, sigma: 0.75 });

  const [imageData, thumbnailBuffer] = await Promise.all([
    image.toBuffer({ resolveWithObject: true }),
    image.clone().resize(20, 20, { fit: 'inside' }).webp().toBuffer(),
  ]);

  const photoId = v4();

  await s3
    .upload({
      ACL: 'public-read',
      Body: imageData.data,
      Bucket: Config.S3_BUCKET,
      ContentType: 'image/webp',
      Key: photoId,
    })
    .promise();

  const exifData = (await parseExif(uploadedPhoto)) as
    | {
        DateTimeOriginal?: Date;
        latitude?: number;
        longitude?: number;
      }
    | undefined;

  const postData: Prisma.PostCreateInput = {
    photo: {
      create: {
        height: imageData.info.height,
        id: photoId,
        size: imageData.info.size,
        thumbnailURL: `data:image/${imageData.info.format};base64,${thumbnailBuffer.toString(
          'base64',
        )}`,
        type: PhotoType.ORIGINAL,
        user: {
          connect: {
            id: user.id,
          },
        },
        width: imageData.info.width,
      },
    },
    user: {
      connect: {
        id: user.id,
      },
    },
  };

  if (exifData && typeof exifData.latitude === 'number' && typeof exifData.longitude === 'number') {
    const geoData = await geocode(exifData.longitude, exifData.latitude);

    if (geoData.city) {
      if (geoData.country) {
        postData.location = `${geoData.city}, ${geoData.country}`;
      } else {
        postData.location = geoData.city;
      }
    } else if (geoData.county) {
      if (geoData.country) {
        postData.location = `${geoData.county}, ${geoData.country}`;
      } else {
        postData.location = geoData.county;
      }
    } else if (geoData.country) {
      postData.location = geoData.country;
    }
  }

  await prisma.post.create({
    data: postData,
  });

  logger.info('Post added to index');

  revalidatePath('/', 'layout');
  revalidatePath('/settings');
}

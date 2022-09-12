import 'dotenv/config';
import 'reflect-metadata';
import 'tsconfig-paths/register';
import { faker } from '@faker-js/faker';
import axios from 'axios';
import { Post } from '@entities/Post';
import { logger } from '@utils/logger';

const [, , num = '1'] = process.argv;

const n = parseInt(num, 10);
if (Number.isNaN(n)) {
  throw new Error(`"${num}" is not a number`);
}

Promise.all(
  new Array(n).fill(null).map(async () => {
    const token = await Post.requestUploadToken(
      `${faker.address.city()}, ${faker.address.country()}`,
      faker.random.words(3),
      faker.date.past()
    );
    logger.info(token, 'Upload token created');
    const { data } = await axios.get<string>(faker.image.abstract(), {
      responseType: 'arraybuffer',
    });
    logger.info('image downloaded');
    await axios.put(token.url, data, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });
    logger.info('image uploaded');
    await Post.processUpload(token.token);
  })
);

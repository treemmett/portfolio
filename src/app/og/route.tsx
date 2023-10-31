import { ImageResponse } from 'next/og';
import sharp from 'sharp';
import { getPosts } from '@lib/getPosts';

const width = 1200;
const height = 630;

export async function GET() {
  const posts = await getPosts();
  const images = posts.slice(0, 4);

  const jpegs = await Promise.all(
    images.map(async (post) => {
      const webPBuffer = await fetch(post.photo.url).then((r) => r.arrayBuffer());
      const buffer = Buffer.alloc(webPBuffer.byteLength);
      const view = new Uint8Array(webPBuffer);
      for (let i = 0; i < buffer.length; i += 1) {
        buffer[i] = view[i];
      }
      const image = sharp(buffer);
      const jpegBuffer = await image
        .resize({ fit: 'cover', height: height / 2, width: width / 2 })
        .jpeg()
        .toBuffer();
      return `data:image/jpeg;base64,${jpegBuffer.toString('base64')}`;
    }),
  );

  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: 'black',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          height: '100%',
          position: 'relative',
          width: '100%',
        }}
      >
        {jpegs.map((src) => (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img
            height={height / 2}
            src={src}
            style={{
              display: 'block',
              height: height / 2,
              objectFit: 'cover',
              width: width / 2 - 2,
            }}
            width={width / 2}
          />
        ))}
      </div>
    ),
  );
}

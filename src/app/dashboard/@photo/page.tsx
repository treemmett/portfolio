import Image from 'next/image';
import { Config } from '@utils/config';
import { formatDate } from '@utils/date';
import { prisma } from '@utils/prisma';

export default async function DashboardPhoto() {
  const post = await prisma.post.findFirst({
    include: { photo: true },
    orderBy: { created: 'desc' },
    where: { user: { username: Config.DEFAULT_USER } },
  });

  if (!post?.photo) return null;

  return (
    <div className="relative">
      <Image
        alt={[post.title, post.location, post.created.toISOString()].filter((i) => !!i).join(', ')}
        blurDataURL={post.photo.thumbnailURL}
        className="block w-full h-auto select-none"
        height={post.photo.height}
        placeholder="blur"
        src={
          Config.CDN_URL
            ? `${Config.CDN_URL}/${post.photo.id}`
            : `${Config.S3_URL}/${Config.S3_BUCKET}/${post.photo.id}`
        }
        width={post.photo.width}
        priority
      />
      {(post.title || post.location || post.created) && (
        <div className="absolute bottom-0 left-0 w-full p-2 backdrop-blur-sm bg-neutral-200/30 dark:bg-neutral-900/50 drop-shadow-lg">
          {post.title && <div className="text-base sm:text-lg">{post.title}</div>}
          {(post.location || post.created) && (
            <div className="text-xs sm:text-sm flex justify-between">
              <span>{post.location}</span>
              <span>{formatDate(post.created)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

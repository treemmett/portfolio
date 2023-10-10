import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Editor } from './Editor';
import { getUser } from '@app/getUser';
import { getPost } from '@lib/getPost';
import { getSite } from '@lib/getSite';

export default async function PostEditPage({ params }: { params: { postId: string } }) {
  const [user, site, post] = await Promise.all([
    getUser().catch(() => {}),
    getSite(),
    getPost(params.postId),
  ]);

  if (!site || site?.ownerId !== user?.id) {
    notFound();
  }

  return (
    <div className="m-4 flex h-full w-full flex-col items-center overflow-auto md:flex-row md:gap-8">
      <div className="relative flex h-1/2 grow items-center justify-center md:h-full md:w-1/2">
        <Image
          alt={post.title || post.created.toISOString()}
          blurDataURL={post.photo.thumbnailURL}
          className="max-h-full max-w-full !bg-contain object-contain"
          height={post.photo.height}
          placeholder="blur"
          src={post.photo.url}
          width={post.photo.width}
          priority
        />
      </div>
      <Editor post={post} />
    </div>
  );
}

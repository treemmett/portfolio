import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ScrollLock } from '@components/ScrollLock';
import { getPost } from '@lib/getPost';

export default async function GalleryPostPage({ params }: { params: { postId: string } }) {
  const post = await getPost(params.postId, 'tregan');

  if (!post || !post.photo || !post.photo.url) return notFound();

  return (
    <div className="fixed w-screen h-screen p-2">
      <ScrollLock />
      <div
        className="max-w-full max-h-full bg-contain object-contain"
        style={{
          aspectRatio: `auto ${post.photo.width} / ${post.photo.height}`,
          height: post.photo.height,
          width: post.photo.width,
        }}
      >
        <Image
          alt={post.title || post.created.toISOString()}
          blurDataURL={post.photo.thumbnailURL}
          className="max-w-full max-h-full bg-contain object-contain"
          height={post.photo.height}
          placeholder="blur"
          src={post.photo.url}
          width={post.photo.width}
          priority
        />
      </div>
    </div>
  );
}

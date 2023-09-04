import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { X } from 'react-feather';
import { ScrollLock } from '@components/ScrollLock';
import { getPost } from '@lib/getPost';

export default async function GalleryPostPage({
  params,
}: {
  params: { postId: string; username: string };
}) {
  const post = await getPost(params.postId, params.username);

  if (!post || !post.photo || !post.photo.url) return notFound();

  return (
    <div className="fixed w-screen h-screen p-4 bg-neutral-900/90">
      <ScrollLock />
      <div className="fixed top-0 py-6 px-8 left-0 flex w-full">
        <Link className="button ml-auto" href="/gallery">
          <X />
        </Link>
      </div>
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

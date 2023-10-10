import Image from 'next/image';
import Link from 'next/link';
import { X } from 'react-feather';
import { EditButton } from './EditButton';
import { getPost } from '@lib/getPost';

export default async function GalleryPostPage({ params }: { params: { postId: string } }) {
  const post = await getPost(params.postId);

  return (
    <div
      className="max-h-full max-w-full"
      style={{
        aspectRatio: `auto ${post.photo.width} / ${post.photo.height}`,
      }}
    >
      <div className="fixed left-0 left-0 top-0 flex w-full justify-end gap-2 px-8 py-6">
        <EditButton />
        <Link className="button action" href="/">
          <X strokeWidth={1} />
        </Link>
      </div>
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
  );
}

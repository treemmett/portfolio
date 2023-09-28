import Image from 'next/image';
import { notFound } from 'next/navigation';
import { DynamicEditor } from './DynamicEditor';
import { getPost } from '@lib/getPost';

export default async function GalleryPostPage({ params }: { params: { postId: string } }) {
  const post = await getPost(params.postId, 'tregan');

  if (!post || !post.photo || !post.photo.url) return notFound();

  return (
    <div
      className="max-w-full max-h-full"
      style={{
        aspectRatio: `auto ${post.photo.width} / ${post.photo.height}`,
      }}
    >
      <Image
        alt={post.title || post.created.toISOString()}
        blurDataURL={post.photo.thumbnailURL}
        className="max-w-full max-h-full !bg-contain object-contain"
        height={post.photo.height}
        placeholder="blur"
        src={post.photo.url}
        width={post.photo.width}
        priority
      />
      <DynamicEditor post={post} />
    </div>
  );
}

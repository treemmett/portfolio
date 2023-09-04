import classNames from 'classnames';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import styles from './gallery.module.scss';
import { getPost } from '@lib/getPost';

export default async function GalleryPostPage({ params }: { params: { postId: string } }) {
  const post = await getPost(params.postId, 'tregan');

  if (!post || !post.photo || !post.photo.url) return notFound();

  return (
    <div className={styles.photo}>
      <Image
        alt={post.title || post.created.toISOString()}
        blurDataURL={post.photo.thumbnailURL}
        className={classNames(styles.img, styles.overlay)}
        height={post.photo.height}
        placeholder="blur"
        sizes={new Array(12)
          .fill(null)
          .map((_, i) => `(max-width: ${(i + 1) * 260}px) ${Math.floor(100 / (i + 1))}vw`)
          .join(', ')}
        src={post.photo.url}
        width={post.photo.width}
        priority
      />
      <Image
        alt={post.title || post.created.toISOString()}
        blurDataURL={post.photo.thumbnailURL}
        className={styles.img}
        height={post.photo.height}
        placeholder="blur"
        sizes="95w"
        src={post.photo.url}
        width={post.photo.width}
        priority
      />
    </div>
  );
}

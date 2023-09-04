import classNames from 'classnames';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import styles from './gallery.module.scss';
import { getPost } from '@lib/getPost';

export default async function GalleryPostPage({ params }: { params: { postId: string } }) {
  const post = await getPost(params.postId, 'tregan');

  if (!post || !post.photo || !post.photo.url) return notFound();

  return (
    <div className={styles.overlay}>
      <div
        className={styles.photo}
        style={{
          aspectRatio: `auto ${post.photo.width} / ${post.photo.height}`,
          height: post.photo.height,
          width: post.photo.width,
        }}
      >
        <Image
          alt={post.title || post.created.toISOString()}
          blurDataURL={post.photo.thumbnailURL}
          className={classNames(styles.img)}
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

import cx from 'classnames';
import { PropsWithChildren } from 'react';
import styles from './Mosaic.module.scss';
import { Tile } from './Tile';
import { getPosts } from '@lib/getPosts';

export default async function GalleryPage({ children }: PropsWithChildren) {
  const posts = await getPosts();

  return (
    <>
      {children}
      <div className={cx('gap-4 p-4', styles.mosaic)}>
        {posts?.map((post, i) => <Tile key={post.id} post={post} priority={i < 5} />)}
      </div>
    </>
  );
}

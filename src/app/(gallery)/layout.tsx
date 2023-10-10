import cx from 'classnames';
import { PropsWithChildren } from 'react';
import styles from './Mosaic.module.scss';
import { Tile } from './Tile';
import { Nav } from '@components/Nav';
import { getPosts } from '@lib/getPosts';

export default async function GalleryPage({ children }: PropsWithChildren) {
  const posts = await getPosts();

  return (
    <>
      <Nav />
      {children}
      <div className={cx('gap-4 p-4', styles.mosaic)}>
        {posts?.map((post, i) => <Tile key={post.id} post={post} priority={i < 5} />)}
      </div>
    </>
  );
}

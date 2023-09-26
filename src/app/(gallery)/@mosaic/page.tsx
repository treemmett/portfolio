import cx from 'classnames';
import styles from './Mosaic.module.scss';
import { Tile } from './Tile';
import { getPosts } from '@lib/getPosts';

export default async function Mosaic() {
  const posts = await getPosts('tregan');

  return (
    <div className={cx('p-4 gap-4', styles.mosaic)}>
      {posts?.map((post, i) => <Tile key={post.id} post={post} priority={i < 5} />)}
    </div>
  );
}

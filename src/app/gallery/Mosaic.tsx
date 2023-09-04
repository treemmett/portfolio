import styles from './Mosaic.module.scss';
import { Tile } from './Tile';
import { getPosts } from '@lib/getPosts';

export async function Mosaic() {
  const posts = await getPosts('tregan');

  return (
    <div className={styles.mosaic}>
      {posts?.map((post, i) => <Tile key={post.id} post={post} priority={i < 5} />)}
    </div>
  );
}

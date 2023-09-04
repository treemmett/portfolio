import styles from './Mosaic.module.scss';
import { Tile } from './Tile';
import { getPosts } from '@lib/getPosts';

export async function Mosaic({ username }: { username: string }) {
  const posts = await getPosts(username);

  return (
    <div className={styles.mosaic}>
      {posts?.map((post, i) => <Tile key={post.id} post={post} priority={i < 5} />)}
    </div>
  );
}

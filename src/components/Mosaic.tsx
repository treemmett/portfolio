import { LightBox } from './LightBox';
import styles from './Mosaic.module.scss';
import { Tile } from './Tile';
import { Post } from '@entities/Post';

export async function Mosaic() {
  const posts = await Post.getAllFromUser('tregan');

  return (
    <>
      <div className={styles.mosaic}>
        {posts?.map((post, i) => <Tile key={post.id} post={post} priority={i < 5} />)}
      </div>
      <LightBox posts={posts} />
    </>
  );
}

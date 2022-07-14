import { FC } from 'react';
import type { Post as PostEntity } from '../entities/Post';
import styles from './Gallery.module.scss';
import { Post } from './Post';

export interface GalleryProps {
  posts: PostEntity[];
}

export const Gallery: FC<GalleryProps> = ({ posts }) => (
  <div className={styles.container}>
    {posts.map((post) => (
      <Post key={post.id} post={post} />
    ))}
  </div>
);

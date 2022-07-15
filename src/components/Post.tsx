import cx from 'classnames';
import Image from 'next/future/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, useEffect, useRef } from 'react';
import { PhotoType } from '../entities/PhotoType';
import type { Post as PostEntity } from '../entities/Post';
import { useDataStore } from './DataStore';
import styles from './Post.module.scss';

export interface PostProps {
  post: PostEntity;
  priority?: boolean;
}

export const Post: FC<PostProps> = ({ post, priority }) => {
  const ref = useRef<HTMLDivElement>();

  const { query } = useRouter();
  const { setLightBox } = useDataStore();
  useEffect(() => {
    if (query.post === post.id) {
      setLightBox(ref);
    }
  }, [post.id, query.post, setLightBox]);

  const image = post.photos.find((p) => p.type === PhotoType.ORIGINAL);

  return (
    <div className={styles['post-wrapper']}>
      <Link href={{ query: { post: post.id } }} scroll={false} passHref shallow>
        <a className={cx(styles.post, { [styles.displayed]: query.post === post.id })} href="#foo">
          <div
            className={styles['image-wrapper']}
            ref={ref}
            style={{ backgroundColor: `rgb(${post.red}, ${post.green}, ${post.blue})` }}
          >
            <Image
              alt="some post"
              blurDataURL={image.thumbnailURL}
              className={styles.photo}
              height={image.height}
              placeholder="blur"
              priority={priority}
              sizes="60vh,80vw"
              src={image.url}
              width={image.width}
            />
          </div>
          <div className={styles.under}>
            <span className={styles.date}>{new Date(post.created).toLocaleDateString()}</span>
          </div>
        </a>
      </Link>
    </div>
  );
};

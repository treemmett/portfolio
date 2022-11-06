import cx from 'classnames';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, useEffect, useRef } from 'react';
import { useDataStore } from './DataStore';
import styles from './Post.module.scss';
import { PhotoType } from '@entities/PhotoType';
import type { Post as PostEntity } from '@entities/Post';
import { ReactComponent as Pin } from '@icons/map-pin.svg';
import { formatDate } from '@utils/date';

export interface PostProps {
  post: PostEntity;
  priority?: boolean;
}

export const Post: FC<PostProps> = ({ post, priority }) => {
  const ref = useRef();

  const { query } = useRouter();
  const { dispatch } = useDataStore();
  useEffect(() => {
    if (query.post === post.id) {
      dispatch({
        ref,
        type: 'SET_LIGHT_BOX',
      });
    }
  }, [dispatch, post.id, query.post]);

  const image = post.photos.find((p) => p.type === PhotoType.ORIGINAL);

  return (
    <div className={styles['post-wrapper']} data-testid="post">
      <div className={styles.top}>
        <span className={styles.title} data-testid="title">
          {post.title}
        </span>
      </div>
      <Link
        aria-label={[post.title, post.location, formatDate(post.created)]
          .filter((i) => !!i)
          .join(', ')}
        className={cx(styles.post, { [styles.displayed]: query.post === post.id })}
        href={{ query: { post: post.id } }}
        ref={ref}
        scroll={false}
        passHref
        shallow
      >
        <Image
          alt={post.title}
          blurDataURL={image.thumbnailURL}
          className={styles.photo}
          height={image.height}
          placeholder="blur"
          priority={priority}
          sizes="60vh,80vw"
          src={image.url}
          width={image.width}
        />
      </Link>
      <div className={styles.under}>
        <span className={styles.location} data-testid="location">
          <Pin />
          {[post.location, post.countryName].filter((a) => !!a).join(', ')}
        </span>
        <span className={styles.date}>{formatDate(post.created)}</span>
      </div>
    </div>
  );
};

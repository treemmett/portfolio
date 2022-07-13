import cx from 'classnames';
import Image from 'next/future/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { PhotoType } from '../entities/PhotoType';
import type { Post as PostEntity } from '../entities/Post';
import { getRemValue, mdMin, scaleDimensions, toPx } from '../utils/pixels';
import { useDataStore } from './DataStore';
import styles from './Post.module.scss';

export interface PostProps {
  post: PostEntity;
}

const MAX_HEIGHT = 40 * getRemValue();
const HEIGHT = 0.6;

const WIDTH = 0.9;

export const Post: FC<PostProps> = ({ post }) => {
  const ref = useRef<HTMLAnchorElement>();
  const [height, setHeight] = useState(toPx(0));
  const [width, setWidth] = useState(toPx(0));

  const scaleImage = useCallback(() => {
    const isMobile = window.innerWidth <= mdMin;
    const [photo] = post.photos;

    if (isMobile) {
      const scaled = window.innerWidth * WIDTH;
      const [scaledW, scaledH] = scaleDimensions(
        photo.width,
        photo.height,
        {
          w: scaled,
        },
        ref.current?.parentElement,
        getRemValue()
      );
      setWidth(toPx(scaledW));
      setHeight(toPx(scaledH));
    } else {
      const scaled = window.innerHeight * HEIGHT;
      const [scaledW, scaledH] = scaleDimensions(
        photo.width,
        photo.height,
        {
          h: scaled > MAX_HEIGHT ? MAX_HEIGHT : scaled,
        },
        ref.current?.parentElement,
        getRemValue() * 2
      );
      setWidth(toPx(scaledW));
      setHeight(toPx(scaledH));
    }
  }, [post]);

  useEffect(() => {
    window.addEventListener('resize', scaleImage);
    scaleImage();

    return () => window.removeEventListener('resize', scaleImage);
  }, [scaleImage]);

  /**
   * This effect adds the width/height transition after the post has been
   * rendered, preventing an animation on the initial load
   */
  const [unsetTransition, setUnsetTransition] = useState(true);
  useEffect(() => {
    const loaded = [height, width].every((dimension) => dimension !== '0px');
    if (loaded) {
      setUnsetTransition(true);
    }
  }, [height, width]);

  const { query } = useRouter();
  const { setLightBox } = useDataStore();
  useEffect(() => {
    if (query.post === post.id) {
      setLightBox(ref);
    }
  }, [post.id, query.post, setLightBox]);

  const image = post.photos.find((p) => p.type === PhotoType.ORIGINAL);

  return (
    <Link href={{ query: { post: post.id } }} scroll={false} passHref shallow>
      <a
        className={cx(styles.post, { [styles.displayed]: query.post === post.id })}
        href="#foo"
        ref={ref}
        style={{ height, transition: unsetTransition && 'unset', width }}
      >
        <div
          className={styles['image-wrapper']}
          style={{ height, transition: unsetTransition && 'unset', width }}
        >
          <div
            className={cx(styles.placeholder, styles.photo)}
            style={{ backgroundColor: `rgb(${post.red}, ${post.green}, ${post.blue})` }}
          />
          <Image
            className={styles.photo}
            height={image.height}
            src={image.url}
            width={image.width}
          />
        </div>
        <div className={styles.under}>
          <span className={styles.date}>{new Date(post.created).toLocaleDateString()}</span>
        </div>
      </a>
    </Link>
  );
};

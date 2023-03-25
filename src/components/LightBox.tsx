import classNames from 'classnames';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './LightBox.module.scss';
import { Modal } from './Modal';
import { AuthorizationScopes } from '@entities/Jwt';
import { usePosts } from '@lib/posts';
import { useSession } from '@lib/session';
import { trace } from '@utils/analytics';
import { formatDate } from '@utils/date';
import { scaleDimensions, toPx } from '@utils/pixels';
import { toString } from '@utils/queryParam';

const DynamicEditor = dynamic(() => import('./Editor').then((mod) => mod.Editor), {
  loading: () => <span>Loading...</span>,
});

export const LightBox: FC = () => {
  const { query, push } = useRouter();
  const { posts } = usePosts();
  const { hasPermission } = useSession();

  const post = useMemo(() => posts?.find((p) => p.id === query.post), [query.post, posts]);

  const galleryRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>();
  const [top, setTop] = useState<number>();
  const [left, setLeft] = useState<number>();
  useEffect(() => {
    if (query.post) {
      trace('photo-viewed', {
        id: toString(query.post),
      });
    }

    if (!query.post) {
      setWidth(0);
      setHeight(0);
      setLeft(0);
      setTop(0);
    }
  }, [query.post]);

  const scaleImage = useCallback(() => {
    if (!post?.photo) return;

    const [w, h] = scaleDimensions(
      post.photo.width,
      post.photo.height,
      { h: post.photo.height },
      galleryRef.current
    );
    setWidth(w);
    setHeight(h);
    setLeft(window.innerWidth / 2 - w / 2);
    setTop(window.innerHeight / 2 - h / 2);
  }, [post, galleryRef]);

  useEffect(() => {
    scaleImage();
    window.addEventListener('resize', scaleImage);
    return () => window.removeEventListener('resize', scaleImage);
  }, [width, height, post?.photo, scaleImage]);

  const closeLightBox = useCallback(() => {
    push({ query: {} }, undefined, { scroll: false, shallow: true });
  }, [push]);

  return (
    <Modal
      className={classNames(styles['light-box'], {
        [styles['panel-open']]: hasPermission(AuthorizationScopes.post),
      })}
      onClose={closeLightBox}
      open={!!post}
      ref={galleryRef}
    >
      {post && (
        <>
          <div className={styles.photo}>
            <Image
              alt={post.title || formatDate(post.created)}
              blurDataURL={post.photo.thumbnailURL}
              className={styles.img}
              height={post.photo.height}
              placeholder="blur"
              sizes="95vw"
              src={post.photo.url}
              style={{
                height: toPx(height),
                left: toPx(left),
                top: toPx(top),
                width: toPx(width),
              }}
              width={post.photo.width}
              priority
            />
          </div>
          {hasPermission(AuthorizationScopes.post) && <DynamicEditor id={post.id} />}
        </>
      )}
    </Modal>
  );
};

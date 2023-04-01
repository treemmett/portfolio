import classNames from 'classnames';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReactComponent as Left } from '../icons/chevron-left.svg';
import { ReactComponent as Right } from '../icons/chevron-right.svg';
import styles from './LightBox.module.scss';
import { Modal } from './Modal';
import { AuthorizationScopes } from '@entities/Jwt';
import { usePost, usePosts } from '@lib/posts';
import { useUser } from '@lib/user';
import { trace } from '@utils/analytics';
import { formatDate } from '@utils/date';
import { scaleDimensions, toPx } from '@utils/pixels';
import { toString } from '@utils/queryParam';

const DynamicEditor = dynamic(() => import('./Editor').then((mod) => mod.Editor), {
  loading: () => <span>Loading...</span>,
});

export const LightBox: FC = () => {
  const { query, pathname, push } = useRouter();
  const { posts } = usePosts();
  const { post, index } = usePost(query.post as string);
  const { hasPermission } = useUser();
  const [prevPost, nextPost] = useMemo(() => {
    if (typeof index === 'undefined' || !posts?.length) {
      return [undefined, undefined];
    }

    if (index === 0) {
      return [posts[posts.length - 1], posts[index + 1]];
    }

    if (index === posts.length - 1) {
      return [posts[index - 1], posts[0]];
    }

    return [posts[index - 1], posts[index + 1]];
  }, [index, posts]);

  const [displayOverlay, setDisplayOverlay] = useState(true);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>();
  const [top, setTop] = useState<number>();
  const [left, setLeft] = useState<number>();
  useEffect(() => {
    if (query.post) {
      setDisplayOverlay(true);
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
    setDisplayOverlay(true);
    const q = { ...query };
    delete q.post;
    push({ pathname, query: q }, undefined, { scroll: false, shallow: true });
  }, [pathname, push, query]);

  const [canClose, setCanClose] = useState(true);

  return (
    <Modal
      canClose={canClose}
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
              className={classNames(styles.img, styles.overlay)}
              height={post.photo.height}
              placeholder="blur"
              sizes={new Array(12)
                .fill(null)
                .map((_, i) => `(max-width: ${(i + 1) * 260}px) ${Math.floor(100 / (i + 1))}vw`)
                .join(', ')}
              src={post.photo.url}
              style={{
                display: displayOverlay ? 'block' : 'none',
                height: toPx(height),
                width: toPx(width),
              }}
              width={post.photo.width}
              priority
            />
            <Image
              alt={post.title || formatDate(post.created)}
              blurDataURL={post.photo.thumbnailURL}
              className={styles.img}
              height={post.photo.height}
              onLoadingComplete={() => setDisplayOverlay(false)}
              placeholder="blur"
              sizes="95w"
              src={post.photo.url}
              style={{
                display: !displayOverlay ? 'block' : 'none',
                height: toPx(height),
                left: toPx(left),
                top: toPx(top),
                width: toPx(width),
              }}
              width={post.photo.width}
              priority
            />

            <div className={styles.controls}>
              {prevPost && (
                <Link href={{ pathname, query: { ...query, post: prevPost.id } }} shallow>
                  <Left />
                </Link>
              )}
              {nextPost && (
                <Link href={{ pathname, query: { ...query, post: nextPost.id } }} shallow>
                  <Right />
                </Link>
              )}
            </div>
          </div>
          {hasPermission(AuthorizationScopes.post) && (
            <DynamicEditor id={post.id} setIsMutating={setCanClose} />
          )}
        </>
      )}
    </Modal>
  );
};

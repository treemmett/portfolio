'use client';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReactComponent as Left } from '../icons/chevron-left.svg';
import { ReactComponent as Right } from '../icons/chevron-right.svg';
import styles from './LightBox.module.scss';
import { Modal } from './Modal';
import { AuthorizationScopes } from '@entities/Jwt';
import { IPost } from '@entities/Post';
import { useUser } from '@lib/user';
import { trace } from '@utils/analytics';
import { scaleDimensions, toPx } from '@utils/pixels';
import { toString } from '@utils/queryParam';

const DynamicEditor = dynamic(() => import('./Editor').then((mod) => mod.Editor), {
  loading: () => <span>Loading...</span>,
});

export const LightBox: FC<{ posts: IPost[] }> = ({ posts }) => {
  const { push } = useRouter();
  const query = useSearchParams();
  const postId = query?.get('post');
  const { hasPermission } = useUser();

  const post = useMemo(() => {
    if (!postId) return undefined;
    return posts?.find((p) => p.id === postId);
  }, [postId, posts]);

  const index = useMemo(() => {
    if (!postId) return undefined;
    return posts?.findIndex((p) => p.id === postId);
  }, [postId, posts]);

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
    if (postId) {
      setDisplayOverlay(true);
      trace('photo-viewed', {
        id: toString(postId),
      });
    }

    if (!postId) {
      setWidth(0);
      setHeight(0);
      setLeft(0);
      setTop(0);
    }
  }, [postId]);

  const scaleImage = useCallback(() => {
    if (!post?.photo) return;

    const [w, h] = scaleDimensions(
      post.photo.width,
      post.photo.height,
      { h: post.photo.height },
      galleryRef.current,
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
    push('../');
  }, [push]);

  const [canClose, setCanClose] = useState(true);
  const [open, setOpen] = useState(!!post);
  useEffect(() => {
    setOpen(!!post);
  }, [post]);

  return (
    <Modal
      canClose={canClose}
      className={classNames(styles['light-box'], {
        [styles['panel-open']]: hasPermission(AuthorizationScopes.post),
      })}
      onClose={closeLightBox}
      onReady={scaleImage}
      open={open}
      ref={galleryRef}
    >
      {post && (
        <>
          <div className={styles.photo}>
            <Image
              alt={post.title || post.created.toISOString()}
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
              alt={post.title || post.created.toISOString()}
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
                <Link href={`/gallery/${prevPost.id}`} shallow>
                  <Left />
                </Link>
              )}
              {nextPost && (
                <Link href={`/gallery/${nextPost.id}`} shallow>
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

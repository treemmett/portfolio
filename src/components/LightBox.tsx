import classNames from 'classnames';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDataStore } from './DataStore';
import styles from './LightBox.module.scss';
import { Modal } from './Modal';
import { AuthorizationScopes } from '@entities/Jwt';
import { PhotoType } from '@entities/PhotoType';
import { trace } from '@utils/analytics';
import { scaleDimensions, toPx } from '@utils/pixels';
import { toString } from '@utils/queryParam';

const DynamicEditor = dynamic(() => import('./Editor').then((mod) => mod.Editor), {
  loading: () => <span>Loading...</span>,
});

export const LightBox: FC = () => {
  const { query, push } = useRouter();
  const { dispatch, posts, session } = useDataStore();

  const post = useMemo(() => posts.find((p) => p.id === query.post), [query.post, posts]);
  const photo = useMemo(() => post?.photos.find((p) => p.type === PhotoType.ORIGINAL), [post]);

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
  }, [dispatch, query.post]);

  const scaleImage = useCallback(() => {
    if (!photo) return;

    const [w, h] = scaleDimensions(
      photo.width,
      photo.height,
      { h: photo.height },
      galleryRef.current
    );
    setWidth(w);
    setHeight(h);
    setLeft(window.innerWidth / 2 - w / 2);
    setTop(window.innerHeight / 2 - h / 2);
  }, [photo, galleryRef]);

  useEffect(() => {
    scaleImage();
    window.addEventListener('resize', scaleImage);
    return () => window.removeEventListener('resize', scaleImage);
  }, [width, height, photo, scaleImage]);

  const closeLightBox = useCallback(() => {
    push({ query: {} }, undefined, { scroll: false, shallow: true });
  }, [push]);

  if (!post) return null;

  return (
    <Modal
      className={classNames(styles['light-box'], {
        [styles['panel-open']]: session.hasPermission(AuthorizationScopes.post),
      })}
      handleChildren={false}
      onClose={closeLightBox}
      open={!!post}
      ref={galleryRef}
    >
      {photo && (
        <div className={styles.photo}>
          <Image
            alt={post.title}
            blurDataURL={photo.thumbnailURL}
            className={styles.img}
            height={photo.height}
            placeholder="blur"
            sizes="95vw"
            src={photo.url}
            style={{ height: toPx(height), left: toPx(left), top: toPx(top), width: toPx(width) }}
            width={photo.width}
            priority
          />
        </div>
      )}
      {session.hasPermission(AuthorizationScopes.post) && <DynamicEditor post={post} />}
    </Modal>
  );
};

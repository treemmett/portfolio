import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from './Button';
import { useDataStore } from './DataStore';
import styles from './LightBox.module.scss';
import { Modal } from './Modal';
import { AuthorizationScopes } from '@entities/Jwt';
import { PhotoType } from '@entities/PhotoType';
import { ReactComponent as Edit } from '@icons/edit.svg';
import { ReactComponent as Trash } from '@icons/trash.svg';
import { trace } from '@utils/analytics';
import { apiClient } from '@utils/apiClient';
import { scaleDimensions, toPx } from '@utils/pixels';
import { toString } from '@utils/queryParam';

export const LightBox: FC = () => {
  const { query, push } = useRouter();
  const { dispatch, posts, session } = useDataStore();

  const post = useMemo(() => posts.find((p) => p.id === query.post), [query.post, posts]);
  const photo = useMemo(() => post?.photos.find((p) => p.type === PhotoType.ORIGINAL), [post]);

  const galleryRef = useRef<HTMLDivElement>();
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
    push({ query: {} }, null, { scroll: false, shallow: true });
  }, [push]);

  const deletePostAction = useCallback(async () => {
    const id = toString(query.post);
    await apiClient.delete(`/post/${encodeURIComponent(id)}`);
    dispatch({
      id,
      type: 'DELETE_POST',
    });
    closeLightBox();
  }, [query.post, dispatch, closeLightBox]);

  const editPost = useCallback(() => {
    push({ query: new URLSearchParams({ edit: toString(query.post) }).toString() }, undefined, {
      shallow: true,
    });
  }, [push, query.post]);

  return (
    <Modal handleChildren={false} onClose={closeLightBox} open={!!post} ref={galleryRef}>
      <div className={styles.actions}>
        {session.hasPermission(AuthorizationScopes.post) && (
          <Button onClick={editPost}>
            <Edit />
          </Button>
        )}
        {session.hasPermission(AuthorizationScopes.delete) && (
          <Button onClick={deletePostAction}>
            <Trash />
          </Button>
        )}
      </div>
      {photo && (
        <Image
          alt={post.title}
          className={styles.photo}
          height={photo.height}
          sizes="95vh,95vw"
          src={photo.url}
          style={{ height: toPx(height), left: toPx(left), top: toPx(top), width: toPx(width) }}
          width={photo.width}
          priority
        />
      )}
    </Modal>
  );
};

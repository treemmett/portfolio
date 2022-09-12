import cx from 'classnames';
import { track } from 'insights-js';
import Image from 'next/future/image';
import { useRouter } from 'next/router';
import {
  FC,
  TransitionEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button } from './Button';
import { useDataStore } from './DataStore';
import styles from './LightBox.module.scss';
import { Modal } from './Modal';
import { AuthorizationScopes } from '@entities/Jwt';
import { PhotoType } from '@entities/PhotoType';
import { ReactComponent as Edit } from '@icons/edit.svg';
import { ReactComponent as Trash } from '@icons/trash.svg';
import { apiClient } from '@utils/apiClient';
import { scaleDimensions, toPx } from '@utils/pixels';
import { toString } from '@utils/queryParam';

enum AnimationFrame {
  /** no photo is opened, and light box is off */
  off,
  /** photo is scaled to the gallery  */
  on_gallery,
  /** photo is transitioning to the light box */
  to_light_box,
  /** photo is on display in light box */
  on_light_box,
  /** photo is transitioning to the light box */
  to_gallery,
}

export const LightBox: FC = () => {
  const { query, push } = useRouter();
  const { dispatch, lightBox, posts, session } = useDataStore();

  const post = useMemo(() => posts.find((p) => p.id === query.post), [query.post, posts]);
  const photo = useMemo(() => post?.photos.find((p) => p.type === PhotoType.ORIGINAL), [post]);

  const galleryRef = useRef<HTMLDivElement>();
  const [frame, setFrame] = useState(AnimationFrame.off);
  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>();
  const [top, setTop] = useState<number>();
  const [left, setLeft] = useState<number>();
  useEffect(() => {
    if (query.post) {
      setFrame(AnimationFrame.on_gallery);
      track({
        id: 'photo-viewed',
        parameters: {
          id: toString(query.post),
        },
      });
    }

    if (!query.post) {
      setWidth(0);
      setHeight(0);
      setLeft(0);
      setTop(0);
      setFrame(AnimationFrame.off);
      dispatch({
        type: 'SET_LIGHT_BOX',
      });
    }
  }, [dispatch, query.post]);

  const scaleImage = useCallback(() => {
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

  const handleTransitionEnd: TransitionEventHandler = useCallback(
    (e) => {
      // to prevent duplicate calls, only respond on `width`
      if (e.propertyName !== 'width') return;

      if (frame === AnimationFrame.to_gallery) {
        setFrame(AnimationFrame.off);
        push({ query: {} }, null, { scroll: false, shallow: true });
      }
    },
    [frame, push]
  );

  const scaleToGallery = useCallback(() => {
    const rect = lightBox.current.getBoundingClientRect();
    setWidth(rect.width);
    setHeight(rect.height);
    setLeft(rect.left);
    setTop(rect.top);
  }, [lightBox]);

  useEffect(() => {
    if (photo && lightBox?.current) {
      if (frame === AnimationFrame.on_gallery) {
        scaleToGallery();
        setTimeout(setFrame, 50, AnimationFrame.to_light_box);
      }

      if (frame === AnimationFrame.to_light_box) {
        window.addEventListener('resize', scaleImage);
        scaleImage();
      }

      if (frame === AnimationFrame.to_gallery) {
        scaleToGallery();
      }
    }

    return () => window.removeEventListener('resize', scaleImage);
  }, [frame, lightBox, width, height, photo, scaleImage, scaleToGallery]);

  const open = ![AnimationFrame.off, AnimationFrame.to_gallery].includes(frame);

  const deletePostAction = useCallback(async () => {
    const id = toString(query.post);
    await apiClient.delete(`/post/${encodeURIComponent(id)}`);
    dispatch({
      id,
      type: 'DELETE_POST',
    });
    setFrame(AnimationFrame.off);
    push({ query: {} }, null, { scroll: false, shallow: true });
  }, [dispatch, query.post, push]);

  const editPost = useCallback(() => {
    push({ query: new URLSearchParams({ edit: toString(query.post) }).toString() }, undefined, {
      shallow: true,
    });
  }, [push, query.post]);

  return (
    <Modal
      handleChildren={false}
      onClose={() => setFrame(AnimationFrame.to_gallery)}
      open={open}
      ref={galleryRef}
    >
      {open && (
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
      )}
      {photo && (
        <Image
          alt={post.title}
          className={cx(styles.photo, {
            [styles.animating]: [AnimationFrame.to_gallery, AnimationFrame.to_light_box].includes(
              frame
            ),
          })}
          height={photo.height}
          onTransitionEnd={handleTransitionEnd}
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

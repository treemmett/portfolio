import cx from 'classnames';
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
import { PhotoType } from '../entities/PhotoType';
import { scaleDimensions, toPx } from '../utils/pixels';
import { useDataStore } from './DataStore';
import styles from './LightBox.module.scss';
import { Modal } from './Modal';

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
  const { lightBox, posts, setLightBox } = useDataStore();

  const photo = useMemo(
    () =>
      posts
        .find((p) => p.id === query.post)
        ?.photos.reduce((acc, cur) => {
          if (acc.type !== PhotoType.SCALED) return cur;
          return cur.type === PhotoType.SCALED && cur.width > acc.width ? cur : acc;
        }),
    [query.post, posts]
  );

  const galleryRef = useRef<HTMLDivElement>();
  const [frame, setFrame] = useState(AnimationFrame.off);
  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>();
  const [top, setTop] = useState<number>();
  const [left, setLeft] = useState<number>();
  useEffect(() => {
    if (query.post) {
      setFrame(AnimationFrame.on_gallery);
    }

    if (!query.post) {
      setWidth(0);
      setHeight(0);
      setLeft(0);
      setTop(0);
      setLightBox();
      setFrame(AnimationFrame.off);
    }
  }, [query.post, setLightBox]);

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
        push({ query: {} }, null, { scroll: false });
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
  }, [frame, lightBox, setLightBox, width, height, photo, scaleImage, scaleToGallery]);

  return (
    <Modal
      handleChildren={false}
      onClose={() => setFrame(AnimationFrame.to_gallery)}
      open={![AnimationFrame.off, AnimationFrame.to_gallery].includes(frame)}
      ref={galleryRef}
    >
      {photo && (
        <img
          alt="My Post"
          className={cx(styles.photo, {
            [styles.animating]: [AnimationFrame.to_gallery, AnimationFrame.to_light_box].includes(
              frame
            ),
          })}
          onTransitionEnd={handleTransitionEnd}
          src={photo.url}
          style={{ height: toPx(height), left: toPx(left), top: toPx(top), width: toPx(width) }}
        />
      )}
    </Modal>
  );
};

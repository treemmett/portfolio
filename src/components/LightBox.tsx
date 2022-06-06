import cx from 'classnames';
import { useRouter } from 'next/router';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { PhotoType } from '../entities/PhotoType';
import { scaleDimensions, toPx } from '../utils/pixels';
import { useDataStore } from './DataStore';
import styles from './LightBox.module.scss';

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

  const galleryRef = useRef();
  const [frame, setFrame] = useState(AnimationFrame.off);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (query.post && lightBox?.current) {
      const rect = lightBox.current.getBoundingClientRect();
      setFrame(AnimationFrame.on_gallery);
      setWidth(rect.width);
      setHeight(rect.height);
    }

    if (!query.post) {
      setWidth(0);
      setHeight(0);
      setLightBox();
    }
  }, [query.post, lightBox, setLightBox]);

  useEffect(() => {
    if (!photo) return;

    if (frame === AnimationFrame.on_gallery) {
      const [w, h] = scaleDimensions(
        photo.width,
        photo.height,
        { w: photo.width },
        galleryRef.current
      );
      setWidth(w);
      setHeight(h);
    }
  }, [photo, frame]);

  return (
    <div
      className={cx(styles['light-box'], { [styles.open]: !!photo })}
      onClick={(e) => {
        if (e.currentTarget === e.target) push({ query: {} });
      }}
      ref={galleryRef}
      role="presentation"
    >
      {photo && (
        <img
          alt="My Post"
          className={cx(styles.photo)}
          src={photo.url}
          style={{
            height: toPx(height),
            width: toPx(width),
          }}
        />
      )}
    </div>
  );
};

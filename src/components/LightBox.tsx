import cx from 'classnames';
import { useRouter } from 'next/router';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { PhotoType } from '../entities/PhotoType';
import { toPx } from '../utils/pixels';
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
  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>();
  const [top, setTop] = useState<number>();
  const [left, setLeft] = useState<number>();
  useEffect(() => {
    if (query.post) {
      setFrame(AnimationFrame.on_gallery);
    }

    if (!query.post) {
      setFrame(AnimationFrame.off);
    }
  }, [query.post]);

  useEffect(() => {
    if (frame === AnimationFrame.on_gallery && lightBox?.current) {
      const rect = lightBox.current.getBoundingClientRect();
      setWidth(rect.width);
      setHeight(rect.height);
      setLeft(rect.left);
      setTop(rect.top);
    }

    if (frame === AnimationFrame.off) {
      setWidth(0);
      setHeight(0);
      setLeft(0);
      setTop(0);
      setLightBox();
    }
  }, [frame, lightBox, setLightBox]);

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
          className={cx(styles.photo, {
            [styles.animating]: [AnimationFrame.to_gallery, AnimationFrame.to_light_box].includes(
              frame
            ),
          })}
          src={photo.url}
          style={{ height: toPx(height), left: toPx(left), top: toPx(top), width: toPx(width) }}
        />
      )}
    </div>
  );
};

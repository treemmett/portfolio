import cx from 'classnames';
import { useRouter } from 'next/router';
import { FC, useMemo } from 'react';
import { PhotoType } from '../entities/PhotoType';
import { useDataStore } from './DataStore';
import styles from './LightBox.module.scss';

export const LightBox: FC = () => {
  const { query } = useRouter();
  const { posts } = useDataStore();

  const photo = useMemo(
    () => posts.find((p) => p.id === query.post)?.photos.find((p) => p.type === PhotoType.SCALED),
    [query.post, posts]
  );

  return (
    <div className={cx(styles['light-box'], { [styles.open]: !!photo })}>
      {photo && <img alt="My Post" className={styles.photo} src={photo.url} />}
    </div>
  );
};

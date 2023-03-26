import { useTranslation } from 'next-i18next';
import { FC } from 'react';
import styles from './Mosaic.module.scss';
import { Tile } from './Tile';
import { usePosts } from '@lib/posts';

export const Mosaic: FC = () => {
  const { posts } = usePosts();
  const { t } = useTranslation();

  if (!posts?.length)
    return <div className={styles.placeholder}>{t('Upload some photos to get started')}</div>;

  return (
    <div className={styles.mosaic}>
      {posts?.map((post, i) => (
        <Tile key={post.id} post={post} priority={i < 5} />
      ))}
    </div>
  );
};

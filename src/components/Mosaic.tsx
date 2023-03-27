import { useTranslation } from 'next-i18next';
import { FC } from 'react';
import styles from './Mosaic.module.scss';
import { Tile } from './Tile';
import { usePosts } from '@lib/posts';
import { useSite } from '@lib/site';
import { useUser } from '@lib/user';

export const Mosaic: FC = () => {
  const { user } = useUser();
  const { site } = useSite();
  const { posts } = usePosts();
  const { t } = useTranslation();

  if (!posts?.length)
    return (
      <div className={styles.placeholder}>
        {site?.owner.id === user?.id ? t('Upload some photos to get started') : t('No photos')}
      </div>
    );

  return (
    <div className={styles.mosaic}>
      {posts?.map((post, i) => (
        <Tile key={post.id} post={post} priority={i < 5} />
      ))}
    </div>
  );
};

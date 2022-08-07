import { FC } from 'react';
import styles from './ApiManager.module.scss';
import { useDataStore } from './DataStore';

export const ApiManager: FC = () => {
  const { requests } = useDataStore();

  if (!requests.length) return null;

  return (
    <div className={styles.manager}>
      <header>Uploading</header>
      {requests.map((r) => (
        <div className={styles.item} key={r.id}>
          {r.progress * 100}% - {r.status}
        </div>
      ))}
    </div>
  );
};

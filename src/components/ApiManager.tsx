import cx from 'classnames';
import { FC, useState } from 'react';
import { ReactComponent as ChevronDown } from '../icons/chevron-down.svg';
import { ReactComponent as ChevronUp } from '../icons/chevron-up.svg';
import styles from './ApiManager.module.scss';
import { Button } from './Button';
import { useDataStore } from './DataStore';

export const ApiManager: FC = () => {
  const { requests } = useDataStore();
  const [collapsed, setCollapsed] = useState(false);

  if (!requests.length) return null;

  return (
    <div className={styles.manager} data-testid="upload-manager">
      <header className={styles.header}>
        <span>Uploading</span>
        <Button
          className={styles['collapse-button']}
          onClick={() => setCollapsed(!collapsed)}
          size="small"
          inverted
        >
          {collapsed ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </header>
      <div className={cx(styles.list, { [styles.collapsed]: collapsed })}>
        {requests.map((r) => (
          <div className={styles.item} key={r.id}>
            {r.thumbnailUrl && (
              <img alt="Uploading thumbnail" className={styles.thumbnail} src={r.thumbnailUrl} />
            )}
            <span>
              {r.progress * 100}% - {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

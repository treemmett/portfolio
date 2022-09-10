import cx from 'classnames';
import { FC, useState } from 'react';
import styles from './MenuButton.module.scss';

export const MenuButton: FC = () => {
  const [active, setActive] = useState(false);

  return (
    <button
      className={cx(styles.menu, styles.cross, { [styles.active]: active })}
      onClick={() => setActive(!active)}
    >
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path className={styles.first} d="M0 70l28-28c2-2 2-2 7-2h64" />
        <path className={styles.second} d="M0 50h99" />
        <path className={styles.third} d="M0 30l28 28c2 2 2 2 7 2h64" />
      </svg>
    </button>
  );
};

import React, { FC } from 'react';
import styles from './Nav.module.scss';
import { useSite } from '@lib/site';

export const Nav: FC = () => {
  const { site } = useSite();

  return (
    <header className={styles.nav}>
      <h1>{site?.name}</h1>
    </header>
  );
};

import classNames from 'classnames';
import React from 'react';
import { Menu } from './Menu';
import styles from './Nav.module.scss';
import { getSite } from '@lib/getSite';

export async function Nav({ className }: { className?: string }) {
  const site = await getSite();

  return (
    <header className={classNames(styles.nav, className)}>
      <h1>{site.name}</h1>

      <Menu site={site} />
    </header>
  );
}

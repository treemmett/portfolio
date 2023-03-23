import React, { FC } from 'react';
import { Anchor } from './Anchor';
import styles from './Nav.module.scss';
import { useSite } from '@lib/site';

export const Nav: FC = () => {
  const { site } = useSite();

  return (
    <header className={styles.nav}>
      <h1>{site?.name}</h1>

      <nav>
        {site?.facebook && (
          <Anchor href={`https://facebook.com/${encodeURIComponent(site.facebook)}`}>
            Facebook
          </Anchor>
        )}
        {site?.github && (
          <Anchor href={`https://github.com/${encodeURIComponent(site.github)}`}>GitHub</Anchor>
        )}
        {site?.imdb && <Anchor href={`https://www.imdb.com/name/${site.imdb}/`}>IMDb</Anchor>}
        {site?.instagram && (
          <Anchor href={`https://www.instagram.com/${site.instagram}/`}>Instagram</Anchor>
        )}
        {site?.twitter && <Anchor href={`https://twitter.com/${site.instagram}/`}>Twitter</Anchor>}
        {site?.linkedIn && (
          <Anchor href={`https://www.linkedin.com/in/${site.linkedIn}/`}>LinkedIn</Anchor>
        )}
      </nav>
    </header>
  );
};

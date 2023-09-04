import classNames from 'classnames';
import React from 'react';
import { Anchor } from './Anchor';
import styles from './Nav.module.scss';
import { getSite } from '@lib/getSite';
import { useTranslation } from '@utils/translation';

export async function Nav({ className }: { className?: string }) {
  const site = await getSite();
  const { t } = useTranslation();

  return (
    <header className={classNames(styles.nav, className)}>
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
        {site?.imdb && (
          <Anchor href={`https://www.imdb.com/name/${encodeURIComponent(site.imdb)}/`}>IMDb</Anchor>
        )}
        {site?.instagram && (
          <Anchor href={`https://www.instagram.com/${encodeURIComponent(site.instagram)}/`}>
            Instagram
          </Anchor>
        )}
        {site?.twitter && (
          <Anchor href={`https://twitter.com/${encodeURIComponent(site.twitter)}/`}>Twitter</Anchor>
        )}
        {site?.linkedIn && (
          <Anchor href={`https://www.linkedin.com/in/${encodeURIComponent(site.linkedIn)}/`}>
            LinkedIn
          </Anchor>
        )}
        <button type="button">{t('Login')}</button>
      </nav>
    </header>
  );
}

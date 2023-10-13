import classNames from 'classnames';
import Link from 'next/link';
import React from 'react';
import { Anchor } from '../../components/Anchor';
import { UserButton } from '../../components/UserButton';
import styles from './Nav.module.scss';
import { getSite } from '@lib/getSite';
import { useTranslation } from '@utils/translation';

export async function Nav({ className }: { className?: string }) {
  const site = await getSite();
  const { t } = useTranslation();

  return (
    <header className={classNames(styles.nav, className)}>
      <h1>{site.name}</h1>

      <nav>
        {site.resumeUrl && <Link href="/resume">{t('Resume')}</Link>}
        {site.facebook && (
          <Anchor href={`https://facebook.com/${encodeURIComponent(site.facebook)}`}>
            Facebook
          </Anchor>
        )}
        {site.github && (
          <Anchor href={`https://github.com/${encodeURIComponent(site.github)}`}>GitHub</Anchor>
        )}
        {site.imdb && (
          <Anchor href={`https://www.imdb.com/name/${encodeURIComponent(site.imdb)}/`}>IMDb</Anchor>
        )}
        {site.instagram && (
          <Anchor href={`https://www.instagram.com/${encodeURIComponent(site.instagram)}/`}>
            Instagram
          </Anchor>
        )}
        {site.twitter && (
          <Anchor href={`https://twitter.com/${encodeURIComponent(site.twitter)}/`}>Twitter</Anchor>
        )}
        {site.linkedIn && (
          <Anchor href={`https://www.linkedin.com/in/${encodeURIComponent(site.linkedIn)}/`}>
            LinkedIn
          </Anchor>
        )}
        <UserButton site={site} />
      </nav>
    </header>
  );
}

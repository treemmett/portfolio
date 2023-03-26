import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FC } from 'react';
import { Anchor } from './Anchor';
import styles from './Nav.module.scss';
import { useSite } from '@lib/site';
import { useUser } from '@lib/user';

export const Nav: FC = () => {
  const { t } = useTranslation();
  const { site } = useSite();
  const { login, logout, user } = useUser();
  const { query } = useRouter();

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
        {user ? (
          <>
            {site?.owner.id === user.id ? (
              <Link href={{ href: '/u/[username]', query: { ...query, settings: true } }} shallow>
                {t('Settings')}
              </Link>
            ) : (
              <Link href={{ href: '/u/[username]', query: { username: user.username } }}>
                {t('My Site')}
              </Link>
            )}
            <button onClick={() => logout()} type="button">
              {t('Logout')}
            </button>
          </>
        ) : (
          <button onClick={() => login()} type="button">
            {t('Login')}
          </button>
        )}
      </nav>
    </header>
  );
};

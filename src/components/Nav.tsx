import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FC } from 'react';
import { Anchor } from './Anchor';
import styles from './Nav.module.scss';
import { useSite } from '@lib/site';
import { useUser } from '@lib/user';
import { useTranslation } from '@utils/translation';

export const Nav: FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation();
  const { site } = useSite();
  const { isLoggingIn, login, logout, user } = useUser();
  const { query } = useRouter();

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
        {user ? (
          <>
            {site?.owner.id === user.id ? (
              <Link href={{ query: { ...query, settings: true } }} shallow>
                {t('Settings')}
              </Link>
            ) : (
              <Link
                href={{ pathname: '/u/[username]', query: { username: user.username } }}
                shallow
              >
                {t('My Site')}
              </Link>
            )}
            <button onClick={() => logout()} type="button">
              {t('Logout')}
            </button>
          </>
        ) : (
          <button disabled={isLoggingIn} onClick={() => login()} type="button">
            {isLoggingIn ? `${t('Logging in')}...` : t('Login')}
          </button>
        )}
      </nav>
    </header>
  );
};

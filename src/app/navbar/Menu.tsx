'use client';

import { Site } from '@prisma/client';
import classNames from 'classnames';
import Link from 'next/link';
import { FC } from 'react';
import { Anchor } from '@components/Anchor';
import { useUser } from '@lib/user';
import { useTranslation } from '@utils/translation';

export const Menu: FC<{ className?: string; site: Site }> = ({ className, site }) => {
  const { t } = useTranslation();
  const { isLoggingIn, login, logout, user } = useUser();

  return (
    <header
      className={classNames(
        'glass fixed top-0 z-10 flex w-screen items-center gap-4 rounded-none p-4',
        className,
      )}
    >
      <h1>{site.name}</h1>

      <nav className="ml-auto flex gap-4">
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
        {user ? (
          <>
            {site?.ownerId === user.id ? (
              <Link href="/settings">{t('Settings')}</Link>
            ) : (
              <Link href={`/u/${encodeURIComponent(user.username)}`}>{t('My Site')}</Link>
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

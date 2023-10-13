'use client';

import { Site } from '@prisma/client';
import Link from 'next/link';
import { FC } from 'react';
import { Anchor } from '@components/Anchor';
import { useUser } from '@lib/user';
import { useTranslation } from '@utils/translation';

export const Menu: FC<{ site: Site }> = ({ site }) => {
  const { t } = useTranslation();
  const { isLoggingIn, login, logout, user } = useUser();

  return (
    <nav>
      {site.resumeUrl && <Link href="/resume">{t('Resume')}</Link>}
      {site.facebook && (
        <Anchor href={`https://facebook.com/${encodeURIComponent(site.facebook)}`}>Facebook</Anchor>
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
  );
};

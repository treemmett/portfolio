'use client';

import { Site } from '@prisma/client';
import classNames from 'classnames';
import Link from 'next/link';
import { FC, useState } from 'react';
import { X, Menu as MenuIcon } from 'react-feather';
import { Anchor } from '@components/Anchor';
import { useUser } from '@lib/user';
import { useTranslation } from '@utils/translation';

export const Menu: FC<{ className?: string; site: Site }> = ({ className, site }) => {
  const { t } = useTranslation();
  const { isLoggingIn, login, logout, user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={classNames(
        'sm:glass fixed top-0 z-10 flex w-screen items-center gap-4 px-4 py-3 sm:p-4',
        className,
        {
          glass: !menuOpen,
        },
      )}
    >
      <div
        className={classNames(
          'fixed left-0 top-0 h-screen w-screen bg-black/70 opacity-0 backdrop-blur-sm motion-safe:transition-opacity sm:pointer-events-none sm:hidden',
          {
            'opacity-100': menuOpen,
            'pointer-events-none': !menuOpen,
          },
        )}
      />
      <button
        aria-label="Open menu"
        className="button action sm:hidden"
        onClick={() => setMenuOpen(true)}
      >
        <MenuIcon strokeWidth={1} />
      </button>

      <Link href="/">
        <h1>{site.name}</h1>
      </Link>

      <nav
        className={classNames(
          'max-sm:glass fixed left-0 top-0 flex h-screen w-1/2 flex-col gap-4 p-4 max-sm:text-white motion-safe:max-sm:transition-[opacity,transform] sm:static sm:ml-auto sm:h-auto sm:w-auto sm:translate-x-0 sm:flex-row sm:p-0 sm:opacity-100',
          {
            '-translate-x-full opacity-0': !menuOpen,
          },
        )}
      >
        <div>
          <button
            aria-label="Close menu"
            className="button action sm:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <X strokeWidth={1} />
          </button>
        </div>
        <Link href="/map">Map</Link>
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
            <button className="inline text-left" onClick={() => logout()} type="button">
              {t('Logout')}
            </button>
          </>
        ) : (
          <button
            className="inline text-left"
            disabled={isLoggingIn}
            onClick={() => login()}
            type="button"
          >
            {isLoggingIn ? `${t('Logging in')}...` : t('Login')}
          </button>
        )}
      </nav>
    </header>
  );
};

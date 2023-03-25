import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import React, { FC } from 'react';
import { ReactComponent as EditIcon } from '../icons/edit.svg';
import { Anchor } from './Anchor';
import styles from './Nav.module.scss';
import { AuthorizationScopes } from '@entities/Jwt';
import { useSession } from '@lib/session';
import { useSite } from '@lib/site';

export const Nav: FC = () => {
  const { t } = useTranslation();
  const { site } = useSite();
  const { login, logout, hasPermission, user } = useSession();

  return (
    <header className={styles.nav}>
      <h1>{site?.name}</h1>

      {hasPermission(AuthorizationScopes.post) && (
        <Link className={styles.edit} href={{ query: { settings: true } }} shallow>
          <EditIcon />
        </Link>
      )}

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
          <button onClick={() => logout()} type="button">
            {t('Logout')}
          </button>
        ) : (
          <button onClick={() => login()} type="button">
            {t('Login')}
          </button>
        )}
      </nav>
    </header>
  );
};

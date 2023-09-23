'use client';

import { sites } from '@prisma/client';
import Link from 'next/link';
import { FC } from 'react';
import { useUser } from '@lib/user';
import { useTranslation } from '@utils/translation';

export const UserButton: FC<{ site?: sites | null }> = ({ site }) => {
  const { isLoggingIn, login, logout, user } = useUser();
  const { t } = useTranslation();

  if (user) {
    return (
      <>
        {site?.ownerId === user.id ? (
          <Link href="?settings=true" shallow>
            {t('Settings')}
          </Link>
        ) : (
          <Link href={{ pathname: '/u/[username]', query: { username: user.username } }} shallow>
            {t('My Site')}
          </Link>
        )}
        <button onClick={() => logout()} type="button">
          {t('Logout')}
        </button>
      </>
    );
  }

  return (
    <button disabled={isLoggingIn} onClick={() => login()} type="button">
      {isLoggingIn ? `${t('Logging in')}...` : t('Login')}
    </button>
  );
};

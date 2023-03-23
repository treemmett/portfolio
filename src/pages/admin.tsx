import { useTranslation } from 'next-i18next';
import { FC, useCallback } from 'react';
import styles from './admin.module.scss';
import { OAuthCloseMessage, OAuthErrorMessage, OAuthSuccessMessage } from './login';
import { Button } from '@components/Button';
import { useDataStore } from '@components/DataStore';
import { Session } from '@entities/Session';
import { trace } from '@utils/analytics';
import { apiClient } from '@utils/apiClient';
import { Config } from '@utils/config';

export const Admin: FC = () => {
  const { t } = useTranslation();
  const { dispatch, session } = useDataStore();

  const login = useCallback(() => {
    if (session?.expiration > new Date()) return;

    trace('begin-login');

    const popup = window.open(
      `https://github.com/login/oauth/authorize?client_id=${Config.NEXT_PUBLIC_GITHUB_CLIENT_ID}`,
      'oauth',
      `popup,width=500,height=750,left=${global.screen.width / 2 - 250}`
    );

    const intervalId = setInterval(() => {
      if (popup.closed) {
        trace('login-closed');
        dispatch({ type: 'LOGOUT' });
        clearInterval(intervalId);
      }
    }, 100);

    const messageHandler = async (event: MessageEvent<OAuthSuccessMessage | OAuthErrorMessage>) => {
      if (event.origin !== window.location.origin) {
        trace('login-failed', {
          type: 'cross-origin',
        });
        throw new Error('Message failed cross-origin check');
      }

      clearInterval(intervalId);

      event.source.postMessage({
        type: 'OAUTH_CLOSE',
      } as OAuthCloseMessage);

      window.removeEventListener('message', messageHandler);

      if (event.data.type === 'OAUTH_ERROR') {
        dispatch({ type: 'LOGOUT' });
        trace('login-failed', {
          error: event.data.payload,
          type: 'provider-rejected',
        });
        throw new Error(event.data.payload);
      }

      if (event.data.type === 'OAUTH_CODE') {
        trace('login-granted');
        const loginResponse = await apiClient.post('/login', { code: event.data.payload });
        const s = new Session(loginResponse.data);
        trace('login-success', {
          expiration: s.expiration?.toISOString(),
          scope: s.scope?.join(','),
          username: s.username,
        });
        dispatch({ session: s, type: 'LOGIN' });
      }
    };

    dispatch({ session: session.startAuthorization(), type: 'LOGIN' });

    window.addEventListener('message', messageHandler);
  }, [dispatch, session]);

  if (!session.isValid()) {
    return (
      <div className={styles.login}>
        <Button onClick={login} type="primary">
          {t('Login')}
        </Button>
      </div>
    );
  }

  return <div>{t('Logged in')}</div>;
};

export default Admin;

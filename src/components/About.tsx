import cx from 'classnames';
import { track } from 'insights-js';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { FC, PropsWithChildren, useCallback, useRef, useState } from 'react';
import styles from './About.module.scss';
import { Anchor } from './Anchor';
import { Button } from './Button';
import { useDataStore } from './DataStore';
import { MenuButton } from './MenuButton';
import { Session } from '@entities/Session';
import { ReactComponent as GitHub } from '@icons/github.svg';
import { ReactComponent as Instagram } from '@icons/instagram.svg';
import { ReactComponent as LinkedIn } from '@icons/linkedin.svg';
import { ReactComponent as Logout } from '@icons/logout.svg';
import { ReactComponent as User } from '@icons/user.svg';
import { OAuthCloseMessage, OAuthErrorMessage, OAuthSuccessMessage } from '@pages/login';
import { apiClient } from '@utils/apiClient';
import { Config } from '@utils/config';

export const About: FC = () => {
  const { dispatch, session } = useDataStore();
  const [showMenu, setShowMenu] = useState(false);
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>();

  const login = useCallback(() => {
    if (session?.expiration > new Date()) return;

    track({
      id: 'begin-login',
    });

    const popup = window.open(
      `https://github.com/login/oauth/authorize?client_id=${Config.NEXT_PUBLIC_GITHUB_CLIENT_ID}`,
      'oauth',
      `popup,width=500,height=750,left=${global.screen.width / 2 - 250}`
    );

    const intervalId = setInterval(() => {
      if (popup.closed) {
        track({
          id: 'login-closed',
        });
        dispatch({ type: 'LOGOUT' });
        clearInterval(intervalId);
      }
    }, 100);

    const messageHandler = async (event: MessageEvent<OAuthSuccessMessage | OAuthErrorMessage>) => {
      if (event.origin !== window.location.origin) {
        track({
          id: 'login-failed',
          parameters: {
            type: 'cross-origin',
          },
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
        track({
          id: 'login-failed',
          parameters: {
            error: event.data.payload,
            type: 'provider-rejected',
          },
        });
        throw new Error(event.data.payload);
      }

      if (event.data.type === 'OAUTH_CODE') {
        track({ id: 'login-granted' });
        const loginResponse = await apiClient.post('/login', { code: event.data.payload });
        const s = new Session(loginResponse.data);
        track({
          id: 'login-success',
          parameters: {
            expiration: s.expiration?.toISOString(),
            scope: s.scope?.join(','),
            username: s.username,
          },
        });
        dispatch({ session: s, type: 'LOGIN' });
      }
    };

    dispatch({ session: session.startAuthorization(), type: 'LOGIN' });

    window.addEventListener('message', messageHandler);
  }, [dispatch, session]);

  return (
    <>
      <div className={styles.about} ref={ref}>
        <div className={styles.header}>
          <MenuButton
            active={showMenu}
            className={styles['menu-toggle']}
            onClick={() => setShowMenu(!showMenu)}
          />
          <h2 className={styles.title}>
            {session.isValid() ? t('Welcome back') : t('intro', { name: 'Tregan' })}
          </h2>
        </div>
        <nav className={cx(styles.navigation, { [styles.visible]: showMenu })}>
          <main className={styles.main}>
            <p className={styles.summary}>
              A senior software engineer specializing in React, rock climber, and digital nomad.
            </p>
            <div className={styles.links}>
              <Link href="/timeline">Where am I?</Link>
              <Link href="/resume">Resume</Link>
            </div>
            <div className={styles.social}>
              <Anchor
                className={styles.button}
                href="https://github.com/treemmett"
                label="Follow me on GitHub"
                button
              >
                <GitHub />
              </Anchor>
              <Anchor
                className={styles.button}
                href="https://www.instagram.com/treemmett/"
                label="Follow me on Instagram"
                button
              >
                <Instagram />
              </Anchor>
              <Anchor
                className={styles.button}
                href="https://www.linkedin.com/in/treemmett/"
                label="Connect on LinkedIn"
                button
              >
                <LinkedIn />
              </Anchor>
              {Config.NEXT_PUBLIC_GITHUB_CLIENT_ID &&
                (session.isValid() ? (
                  <Button
                    className={styles.button}
                    label="Logout"
                    onClick={() => dispatch({ type: 'LOGOUT' })}
                    testId="logout"
                  >
                    <Logout />
                  </Button>
                ) : (
                  <Button
                    className={styles.button}
                    disabled={session.authorizing}
                    label="Login with GitHub"
                    onClick={login}
                    testId="login"
                  >
                    <User />
                  </Button>
                ))}
            </div>
          </main>
        </nav>
      </div>
      <div className={cx(styles.backdrop, { [styles.open]: showMenu })} />
    </>
  );
};

export interface WithAboutProps extends PropsWithChildren {
  className?: string;
}

/**
 * Wrapper that includes About, and applies padding
 */
export const WithAbout: FC<WithAboutProps> = ({ children, className }) => (
  <div className={cx(className, styles.wrapper)}>
    {children}
    <About />
  </div>
);

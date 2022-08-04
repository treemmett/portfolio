import cx from 'classnames';
import { useTranslation } from 'next-i18next';
import { FC, PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { ReactComponent as GitHub } from '../icons/github.svg';
import { ReactComponent as Instagram } from '../icons/instagram.svg';
import { ReactComponent as LinkedIn } from '../icons/linkedin.svg';
import { ReactComponent as Logout } from '../icons/logout.svg';
import { ReactComponent as User } from '../icons/user.svg';
import { Config } from '../utils/config';
import { toPx } from '../utils/pixels';
import styles from './About.module.scss';
import { Anchor } from './Anchor';
import { Button } from './Button';
import { useDataStore } from './DataStore';

export const About: FC = () => {
  const { destroySession, login, session } = useDataStore();
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const ref = useRef<HTMLElement>();

  const copyDimensions = useCallback(() => {
    if (!ref.current) return;

    const { clientHeight, clientWidth } = ref.current;
    if (clientHeight !== height) {
      setHeight(clientHeight);
    }

    if (clientWidth !== width) {
      setWidth(clientWidth);
    }
  }, [height, width, ref]);

  useEffect(() => {
    window.addEventListener('resize', copyDimensions);
    return () => window.removeEventListener('resize', copyDimensions);
  }, [copyDimensions]);

  useEffect(() => {
    copyDimensions();
  });

  const { t } = useTranslation();

  return (
    <>
      <main className={cx(styles.main, { [styles.default]: !height && !width })} ref={ref}>
        <h2>
          {session.isValid() ? t('Welcome back') : t('intro', { name: Config.NEXT_PUBLIC_NAME })}
        </h2>
        <div className={styles.social}>
          {Config.NEXT_PUBLIC_GITHUB_USERNAME && (
            <Anchor
              className={styles.button}
              href={`https://github.com/${Config.NEXT_PUBLIC_GITHUB_USERNAME}`}
              label="Follow me on GitHub"
              button
            >
              <GitHub />
            </Anchor>
          )}
          {Config.NEXT_PUBLIC_INSTAGRAM_USERNAME && (
            <Anchor
              className={styles.button}
              href={`https://www.instagram.com/${Config.NEXT_PUBLIC_INSTAGRAM_USERNAME}/`}
              label="Follow me on Instagram"
              button
            >
              <Instagram />
            </Anchor>
          )}
          {Config.NEXT_PUBLIC_LINKEDIN_USERNAME && (
            <Anchor
              className={styles.button}
              href={`https://www.linkedin.com/in/${Config.NEXT_PUBLIC_LINKEDIN_USERNAME}/`}
              label="Connect on LinkedIn"
              button
            >
              <LinkedIn />
            </Anchor>
          )}
          {Config.NEXT_PUBLIC_GITHUB_CLIENT_ID &&
            (session.isValid() ? (
              <Button
                className={styles.button}
                label="Logout"
                onClick={destroySession}
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
      <main className={styles.backdrop} style={{ height: toPx(height), width: toPx(width) }} />
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

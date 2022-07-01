import { FC, useCallback, useEffect, useRef, useState } from 'react';
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

  return (
    <>
      <main className={styles.main} ref={ref}>
        <h2>{session.isValid() ? 'Welcome back' : `Hi, I'm ${Config.NEXT_PUBLIC_NAME}`}</h2>
        <div className={styles.social}>
          <Anchor
            className={styles.button}
            href={`https://github.com/${Config.NEXT_PUBLIC_GITHUB_USERNAME}`}
            button
          >
            <GitHub />
          </Anchor>
          <Anchor
            className={styles.button}
            href={`https://www.instagram.com/${Config.NEXT_PUBLIC_INSTAGRAM_USERNAME}/`}
            button
          >
            <Instagram />
          </Anchor>
          <Anchor
            className={styles.button}
            href={`https://www.linkedin.com/in/${Config.NEXT_PUBLIC_LINKEDIN_USERNAME}/`}
            button
          >
            <LinkedIn />
          </Anchor>
          {session.isValid() ? (
            <Button className={styles.button} onClick={destroySession}>
              <Logout />
            </Button>
          ) : (
            <Button className={styles.button} onClick={login}>
              <User />
            </Button>
          )}
        </div>
      </main>
      <main className={styles.backdrop} style={{ height: toPx(height), width: toPx(width) }} />
    </>
  );
};

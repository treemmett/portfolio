import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { ReactComponent as GitHub } from '../icons/github.svg';
import { ReactComponent as Instagram } from '../icons/instagram.svg';
import { ReactComponent as LinkedIn } from '../icons/linkedin.svg';
import { ReactComponent as Logout } from '../icons/logout.svg';
import { ReactComponent as User } from '../icons/user.svg';
import { Config } from '../utils/config';
import { toPx } from '../utils/pixels';
import styles from './About.module.scss';
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
        <h2>{session ? 'Welcome back' : `Hi, I'm ${Config.NEXT_PUBLIC_NAME}`}</h2>
        <div className={styles.social}>
          <Button>
            <GitHub />
          </Button>
          <Button>
            <Instagram />
          </Button>
          <Button>
            <LinkedIn />
          </Button>
          {session ? (
            <Button onClick={destroySession}>
              <Logout />
            </Button>
          ) : (
            <Button onClick={login}>
              <User />
            </Button>
          )}
        </div>
      </main>
      <main className={styles.backdrop} style={{ height: toPx(height), width: toPx(width) }} />
    </>
  );
};

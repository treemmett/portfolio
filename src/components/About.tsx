import { FC } from 'react';
import { ReactComponent as GitHub } from '../icons/github.svg';
import { ReactComponent as Instagram } from '../icons/instagram.svg';
import { ReactComponent as LinkedIn } from '../icons/linkedin.svg';
import { ReactComponent as User } from '../icons/user.svg';
import { Config } from '../utils/config';
import styles from './About.module.scss';
import { Button } from './Button';

export interface AboutProps {
  backdrop?: boolean;
}

export const About: FC<AboutProps> = ({ backdrop }) =>
  backdrop ? (
    <main className={styles.backdrop} />
  ) : (
    <main className={styles.main}>
      <h2>Hi, I'm {Config.NEXT_PUBLIC_NAME}</h2>
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
        <Button>
          <User />
        </Button>
      </div>
    </main>
  );

import { FC } from 'react';
import { Config } from '../utils/config';
import styles from './About.module.scss';

export interface AboutProps {
  backdrop?: boolean;
}

export const About: FC<AboutProps> = ({ backdrop }) =>
  backdrop ? (
    <main className={styles.backdrop} />
  ) : (
    <main className={styles.main}>
      <h2>Hi, I'm {Config.NEXT_PUBLIC_NAME}</h2>
    </main>
  );

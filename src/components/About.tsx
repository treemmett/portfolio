import { FC } from 'react';
import styles from './About.module.scss';

export interface AboutProps {
  backdrop?: boolean;
}

export const About: FC<AboutProps> = ({ backdrop }) =>
  backdrop ? (
    <main className={styles.backdrop} />
  ) : (
    <main className={styles.main}>
      <div>Hi</div>
      {/* <h1>Tregan</h1> */}
    </main>
  );

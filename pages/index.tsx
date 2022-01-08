import { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.scss';

export const Home: NextPage = () => (
  <div className={styles.container}>
    <Head>
      <title>Tregan</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main className={styles.main}>
      <h1 className={styles.title}>Welcome</h1>
    </main>
  </div>
);

export default Home;

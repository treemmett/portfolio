import { NextPage } from 'next';
import Head from 'next/head';
import { Gallery } from '../components/Gallery';
import styles from '../styles/Home.module.scss';

export const Home: NextPage = () => (
  <div className={styles.container}>
    <Head>
      <title>Tregan</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main className={styles.main}>
      <div>Hi, I'm</div>
      <h1>Tregan</h1>
    </main>

    <Gallery />
  </div>
);

export default Home;

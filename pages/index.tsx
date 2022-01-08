import { NextPage } from 'next';
import Head from 'next/head';
import { Post } from '../components/Post';
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

    {new Array(10).fill(null).map((_, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <Post key={i} />
    ))}
  </div>
);

export default Home;

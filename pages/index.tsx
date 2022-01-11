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

    {new Array(4).fill(null).map(() => (
      <Post />
    ))}
  </div>
);

export default Home;

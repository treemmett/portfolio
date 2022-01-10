import { NextPage } from 'next';
import Head from 'next/head';
import { About } from '../components/About';
import { Gallery } from '../components/Gallery';
import styles from '../styles/Home.module.scss';

export const Home: NextPage = () => (
  <div className={styles.container}>
    <Head>
      <title>Tregan</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <About />
    <Gallery />
    <About backdrop />
  </div>
);

export default Home;

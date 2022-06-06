import { NextPage } from 'next';
import Head from 'next/head';
import { About } from '../components/About';
import { Gallery } from '../components/Gallery';
import { LightBox } from '../components/LightBox';
import { Config } from '../utils/config';
import styles from './home.module.scss';

export const Home: NextPage = () => (
  <div className={styles.container}>
    <Head>
      <title>{Config.NEXT_PUBLIC_NAME}</title>
    </Head>

    <Gallery />

    <About />
    <LightBox />
  </div>
);

export default Home;

import { NextPage } from 'next';
import Head from 'next/head';
import { About } from '../components/About';
import { Post } from '../components/Post';
import styles from './home.module.scss';

const images = [
  '/358-1272x1193.jpg',
  '/502-974x410.jpg',
  '/1058-1530x1277.jpg',
  '/1077-840x1021.jpg',
].map((url) => {
  const [, width, height] = /-(\d+)x(\d+)/.exec(url);

  return {
    height: parseInt(height, 10),
    url,
    width: parseInt(width, 10),
  };
});

export const Home: NextPage = () => (
  <div className={styles.container}>
    <Head>
      <title>Tregan</title>
      <link href="/favicon.ico" rel="icon" />
    </Head>

    {images.map(({ height, width, url }) => (
      <Post height={height} key={url} title={url} url={url} width={width} />
    ))}
    <About />
    <About backdrop />
  </div>
);

export default Home;

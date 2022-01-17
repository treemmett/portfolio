import { NextPage } from 'next';
import Head from 'next/head';
import { About } from '../components/About';
import { Post } from '../components/Post';
import styles from '../styles/Home.module.scss';

const images = [
  '/358-1272x1193.jpg',
  '/502-974x410.jpg',
  '/1058-1530x1277.jpg',
  '/1077-840x1021.jpg',
].map((url) => {
  const [, width, height] = /-(\d+)x(\d+)/.exec(url);

  return {
    url,
    width: parseInt(width, 10),
    height: parseInt(height, 10),
  };
});

export const Home: NextPage = () => (
  <div className={styles.container}>
    <Head>
      <title>Tregan</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    {images.map(({ height, width, url }) => (
      <Post height={height} key={url} title={url} width={width} url={url} />
    ))}
    <About />
    <About backdrop />
  </div>
);

export default Home;

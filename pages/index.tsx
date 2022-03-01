import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { About } from '../components/About';
import { Post } from '../components/Post';
import { Photo } from '../entities/Photo';
import { connectToDB } from '../middleware/database';
import styles from './home.module.scss';

export interface IndexProps {
  photos: Photo[];
}

export const Home: NextPage<IndexProps> = ({ photos }) => (
  <div className={styles.container}>
    <Head>
      <title>Tregan</title>
      <link href="/favicon.ico" rel="icon" />
    </Head>

    {photos.map(({ height, width, url }) => (
      <Post height={height} key={url} title={url} url={url} width={width} />
    ))}
    <About />
    <About backdrop />
  </div>
);

export default Home;

export const getServerSideProps: GetServerSideProps<IndexProps> = async () => {
  await connectToDB();

  const p = await Photo.getAll();

  return {
    props: {
      photos: JSON.parse(JSON.stringify(p)),
    },
  };
};

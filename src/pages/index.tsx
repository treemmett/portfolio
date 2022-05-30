import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { About } from '../components/About';
import { Post } from '../components/Post';
import { connectToDB } from '../middleware/database';
// db driver needs to import entities before consumers
// eslint-disable-next-line import/order
import { Post as PostEntity } from '../entities/Post';
import styles from './home.module.scss';

export interface IndexProps {
  posts: PostEntity[];
}

export const Home: NextPage<IndexProps> = ({ posts }) => (
  <div className={styles.container}>
    <Head>
      <title>Tregan</title>
      <link href="/favicon.ico" rel="icon" />
    </Head>

    {posts.map((post) => (
      <Post key={post.id} post={post} />
    ))}
    <About />
    <About backdrop />
  </div>
);

export default Home;

export const getServerSideProps: GetServerSideProps<IndexProps> = async () => {
  await connectToDB();

  const p = await PostEntity.getAll();

  return {
    props: {
      posts: JSON.parse(JSON.stringify(p)),
    },
  };
};

import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';
import { About } from '../components/About';
import { useDataStore } from '../components/DataStore';
import { Post } from '../components/Post';
import { Config } from '../utils/config';
import styles from './home.module.scss';

export const Home: NextPage = () => {
  const { posts, loadPosts } = useDataStore();

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return (
    <div className={styles.container}>
      <Head>
        <title>{Config.NEXT_PUBLIC_NAME}</title>
        <link href="/favicon.ico" rel="icon" />
      </Head>

      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      <About />
      <About backdrop />
    </div>
  );
};

export default Home;

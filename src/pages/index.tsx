import { NextPage } from 'next';
import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import { About } from '../components/About';
import { Post } from '../components/Post';
import { Post as PostEntity } from '../entities/Post';
import { apiClient } from '../utils/clients';
import styles from './home.module.scss';

export const Home: NextPage = () => {
  const [posts, setPosts] = useState<PostEntity[]>([]);

  const loadPosts = useCallback(async () => {
    const { data } = await apiClient.get('/api/post');
    setPosts(data);
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return (
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
};

export default Home;

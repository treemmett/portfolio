import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Suspense } from 'react';
import { About } from '../components/About';
import { DataStoreDefaults, useDataStore } from '../components/DataStore';
import { Gallery } from '../components/Gallery';
import { LightBox } from '../components/LightBox';
import { AuthorizationScopes } from '../entities/Jwt';
import { Post } from '../entities/Post';
import { Config } from '../utils/config';
import styles from './home.module.scss';

const DynamicEditor = dynamic(() => import('../components/Editor').then((mod) => mod.Editor));

export const Home: NextPage = () => {
  const { session } = useDataStore();

  return (
    <div className={styles.container}>
      <Head>
        <title>{Config.NEXT_PUBLIC_NAME}</title>
      </Head>

      <Gallery />

      <About />

      {session.hasPermission(AuthorizationScopes.post) && (
        <Suspense fallback="Loading...">
          <DynamicEditor />
        </Suspense>
      )}

      <LightBox />
    </div>
  );
};

export const getStaticProps: GetStaticProps<DataStoreDefaults> = async ({ locale }) => {
  const posts = await Post.getAll();

  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};

export default Home;

import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { About } from '../components/About';
import { Gallery } from '../components/Gallery';
import { LightBox } from '../components/LightBox';
import { Post } from '../entities/Post';
import { Config } from '../utils/config';
import styles from './home.module.scss';

export const Home: NextPage = () => (
  <div className={styles.container}>
    <Head>
      <title>{Config.NEXT_PUBLIC_NAME}</title>
    </Head>

    <About />

    <Gallery />

    <LightBox />
  </div>
);

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const posts = await Post.getAll();

  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};

export default Home;

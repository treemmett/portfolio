import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { About } from '../components/About';
import { DataStoreDefaults } from '../components/DataStore';
import { Gallery } from '../components/Gallery';
import { LightBox } from '../components/LightBox';
import { Post } from '../entities/Post';
import { Config } from '../utils/config';

export const Home: NextPage = () => (
  <>
    <Head>
      <title>{Config.NEXT_PUBLIC_NAME}</title>
    </Head>

    <Gallery />

    <About />

    <LightBox />
  </>
);

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

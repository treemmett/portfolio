import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { WithAbout } from '../components/About';
import { DefaultState } from '../components/DataStore';
import { Gallery } from '../components/Gallery';
import { LightBox } from '../components/LightBox';
import { Post } from '../entities/Post';

export const getStaticProps: GetStaticProps<DefaultState> = async ({ locale }) => {
  const posts = await Post.getAll();

  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};

export const Home: NextPage = () => (
  <WithAbout>
    <Head>
      <title>Hi, I'm Tregan</title>
      <meta
        content="Hi, I'm Tregan. A senior software engineer specializing in React, rock climber, and digital nomad."
        name="description"
      />
    </Head>

    <Gallery />

    <LightBox />
  </WithAbout>
);

export default Home;

import { GetServerSideProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { DefaultState } from '@components/DataStore';
import { LightBox } from '@components/LightBox';
import { Mosaic } from '@components/Mosaic';
import { Nav } from '@components/Nav';
import { Post } from '@entities/Post';

export const getServerSideProps: GetServerSideProps<DefaultState> = async ({ locale }) => {
  const posts = await Post.getAll(true);

  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};

export const Home: NextPage = () => (
  <>
    <Head>
      <title>Hi, I'm Tregan</title>
      <meta
        content="Hi, I'm Tregan. A senior software engineer specializing in React, rock climber, and digital nomad."
        name="description"
      />
    </Head>

    <Nav />

    <Mosaic />

    <LightBox />
  </>
);

export default Home;

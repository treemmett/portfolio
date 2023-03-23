import { instanceToPlain } from 'class-transformer';
import { GetServerSideProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { LightBox } from '@components/LightBox';
import { Mosaic } from '@components/Mosaic';
import { Nav } from '@components/Nav';
import { Post } from '@entities/Post';
import { Site } from '@entities/Site';
import { connectToDatabase } from '@middleware/database';

export const getServerSideProps: GetServerSideProps = async ({ locale, req }) => {
  await connectToDatabase();

  const [posts, site] = await Promise.all([
    Post.getAll(true),
    Site.findOne({ where: { domain: req.headers.host } }),
  ]);

  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
      site: instanceToPlain(site),
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

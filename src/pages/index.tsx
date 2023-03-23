import { instanceToPlain } from 'class-transformer';
import { GetServerSideProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { LightBox } from '@components/LightBox';
import { Mosaic } from '@components/Mosaic';
import { Nav } from '@components/Nav';
import { Post } from '@entities/Post';
import { Site } from '@entities/Site';
import { useSite } from '@lib/site';
import { connectToDatabase } from '@middleware/database';

export const getServerSideProps: GetServerSideProps = async ({ locale, req }) => {
  await connectToDatabase();

  const [posts, site] = await Promise.all([
    Post.getAll(),
    Site.findOne({ where: { domain: req.headers.host } }),
  ]);

  return {
    props: {
      fallback: {
        site: instanceToPlain(site),
      },
      posts: JSON.parse(JSON.stringify(posts)),
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
};

export const Home: NextPage = () => {
  const { site } = useSite();

  return (
    <>
      <Head>
        {site?.title && <title>{site.title}</title>}
        {site?.description && <meta content={site.description} name="description" />}
      </Head>

      <Nav />

      <Mosaic />

      <LightBox />
    </>
  );
};

export default Home;

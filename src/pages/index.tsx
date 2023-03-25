import { GetServerSideProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { LightBox } from '@components/LightBox';
import { Mosaic } from '@components/Mosaic';
import { Nav } from '@components/Nav';
import { Welcome } from '@components/Welcome';
import { AuthorizationScopes } from '@entities/Jwt';
import { Post } from '@entities/Post';
import { Site } from '@entities/Site';
import { useSite } from '@lib/site';
import { useUser } from '@lib/user';
import { connectToDatabase } from '@middleware/database';

const DynamicUploadManager = dynamic(() =>
  import('@components/ApiManager').then((mod) => mod.ApiManager)
);

const DynamicSettings = dynamic(() => import('@components/Settings').then((mod) => mod.Settings));

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  await connectToDatabase();

  const [posts, site] = await Promise.allSettled([Post.getAll(), Site.find()]);

  return {
    props: {
      fallback: {
        posts: posts.status === 'fulfilled' ? JSON.parse(JSON.stringify(posts.value)) : null,
        site:
          site.status === 'fulfilled' && site.value.length
            ? JSON.parse(JSON.stringify(site.value[0]))
            : null,
      },
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
};

export const Home: NextPage = () => {
  const { site } = useSite();
  const { hasPermission } = useUser();

  return (
    <>
      <Head>
        {site?.title && <title>{site.title}</title>}
        {site?.description && <meta content={site.description} name="description" />}
      </Head>

      <Nav />

      <Mosaic />

      <LightBox />

      <Welcome />

      {hasPermission(AuthorizationScopes.post) && (
        <>
          <DynamicUploadManager />
          <DynamicSettings />
        </>
      )}
    </>
  );
};

export default Home;

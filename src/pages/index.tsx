import { instanceToPlain } from 'class-transformer';
import { GetServerSideProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { LightBox } from '@components/LightBox';
import { Nav } from '@components/Nav';
import { AuthorizationScopes } from '@entities/Jwt';
import { Post } from '@entities/Post';
import { Site } from '@entities/Site';
import { useSession } from '@lib/session';
import { useSite } from '@lib/site';
import { connectToDatabase } from '@middleware/database';

const DynamicUploadManager = dynamic(() =>
  import('@components/ApiManager').then((mod) => mod.ApiManager)
);

export const getServerSideProps: GetServerSideProps = async ({ locale, req }) => {
  await connectToDatabase();

  const [posts, site] = await Promise.all([
    Post.getAll(),
    Site.findOne({ where: { domain: req.headers.host } }),
  ]);

  return {
    props: {
      fallback: {
        posts: JSON.parse(JSON.stringify(posts)),
        site: instanceToPlain(site),
      },
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
};

export const Home: NextPage = () => {
  const { site } = useSite();
  const { hasPermission } = useSession();

  return (
    <>
      <Head>
        {site?.title && <title>{site.title}</title>}
        {site?.description && <meta content={site.description} name="description" />}
      </Head>

      <Nav />

      <LightBox />

      {hasPermission(AuthorizationScopes.post) && <DynamicUploadManager />}
    </>
  );
};

export default Home;

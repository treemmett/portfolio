import { GetServerSideProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { LightBox } from '@components/LightBox';
import { Meta } from '@components/Meta';
import { Mosaic } from '@components/Mosaic';
import { Nav } from '@components/Nav';
import { AuthorizationScopes } from '@entities/Jwt';
import { Post } from '@entities/Post';
import { Site } from '@entities/Site';
import { useUser } from '@lib/user';
import { connectToDatabase } from '@middleware/database';

const DynamicUploadManager = dynamic(() =>
  import('@components/ApiManager').then((mod) => mod.ApiManager)
);

const DynamicSettings = dynamic(() => import('@components/Settings').then((mod) => mod.Settings));

const DynamicWelcome = dynamic(() => import('@components/Welcome').then((mod) => mod.Welcome));

export const getServerSideProps: GetServerSideProps = async ({ locale, req }) => {
  await connectToDatabase();

  let site: Site | null = null;
  if (req.headers.host) {
    site = await Site.getByDomain(req.headers.host).catch(() => null);
  }

  if (!site) {
    site = await Site.getByUsername('tregan');
  }

  const posts = await Post.getAllFromUser(site.owner.username);

  return {
    props: {
      fallback: {
        [`posts/${site.owner.username}`]: JSON.parse(JSON.stringify(posts)),
        site: JSON.parse(JSON.stringify(site)),
      },
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
};

export const Home: NextPage = () => {
  const { hasPermission } = useUser();

  return (
    <>
      <Meta />

      <Nav />

      <Mosaic />

      <LightBox />

      {hasPermission(AuthorizationScopes.onboard) && <DynamicWelcome />}

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

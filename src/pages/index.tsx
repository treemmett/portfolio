import { GetStaticProps, NextPage } from 'next';
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
import { Config } from '@utils/config';

const DynamicUploadManager = dynamic(() =>
  import('@components/ApiManager').then((mod) => mod.ApiManager)
);

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  await connectToDatabase();

  const [site, posts] = await Promise.all([
    Site.getByUsername(Config.DEFAULT_USER),

    Post.getAllFromUser(Config.DEFAULT_USER),
  ]);

  return {
    props: {
      fallback: {
        [`posts/${site.owner.username}`]: JSON.parse(JSON.stringify(posts)),
        site: JSON.parse(JSON.stringify(site)),
      },
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
    revalidate: 60,
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

      {hasPermission(AuthorizationScopes.post) && <DynamicUploadManager />}
    </>
  );
};

export default Home;

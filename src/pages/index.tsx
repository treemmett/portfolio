import { GetStaticProps, NextPage } from 'next';
import dynamic from 'next/dynamic';
import { Meta } from '@components/Meta';
import { Nav } from '@components/Nav';
import { AuthorizationScopes } from '@entities/Jwt';
import { Post } from '@entities/Post';
import { Site } from '@entities/Site';
import { useUser } from '@lib/user';
import { connectToDatabase } from '@middleware/database';

const DynamicUploadManager = dynamic(() =>
  import('@components/ApiManager').then((mod) => mod.ApiManager),
);

export const getStaticProps: GetStaticProps = async () => {
  await connectToDatabase();

  const [site, posts] = await Promise.all([
    Site.getByUsername('tregan'),

    Post.getAllFromUser('tregan'),
  ]);

  return {
    props: {
      fallback: {
        [`posts/${site.owner.username}`]: JSON.parse(JSON.stringify(posts)),
        site: JSON.parse(JSON.stringify(site)),
      },
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

      {hasPermission(AuthorizationScopes.post) && <DynamicUploadManager />}
    </>
  );
};

export default Home;

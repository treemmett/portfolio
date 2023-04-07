import { GetStaticPaths, GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Post } from '@entities/Post';
import { Site } from '@entities/Site';
import { User } from '@entities/User';
import { connectToDatabase } from '@middleware/database';
import { SiteNotFoundError } from '@utils/errors';

// eslint-disable-next-line no-restricted-exports
export { default } from '@pages/.';

export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
  await connectToDatabase();

  const [posts, site] = await Promise.allSettled([
    Post.getAllFromUser(params?.username as string),
    Site.getByUsername(params?.username as string),
  ]);

  if (site.status === 'rejected' && site.reason instanceof SiteNotFoundError) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      fallback: {
        [`posts/${params?.username}`]:
          posts.status === 'fulfilled' ? JSON.parse(JSON.stringify(posts.value)) : null,
        [`site/${params?.username}`]:
          site.status === 'fulfilled' ? JSON.parse(JSON.stringify(site.value)) : null,
      },
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
    revalidate: 60,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  await connectToDatabase();
  const usernames = await User.getUserNames();

  return {
    fallback: true,
    paths: usernames.map((username) => ({ params: { username } })),
  };
};

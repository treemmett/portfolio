import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Post } from '@entities/Post';
import { Site } from '@entities/Site';
import { connectToDatabase } from '@middleware/database';
import { SiteNotFoundError } from '@utils/errors';

// eslint-disable-next-line no-restricted-exports
export { default } from '@pages/.';

export const getServerSideProps: GetServerSideProps = async ({ locale, query }) => {
  await connectToDatabase();

  const [posts, site] = await Promise.allSettled([
    Post.getAllFromUser(query.username as string),
    Site.getByUsername(query.username as string),
  ]);

  if (site.status === 'rejected' && site.reason instanceof SiteNotFoundError) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      fallback: {
        [`posts/${query.username}`]:
          posts.status === 'fulfilled' ? JSON.parse(JSON.stringify(posts.value)) : null,
        [`site/${query.username}`]:
          site.status === 'fulfilled' ? JSON.parse(JSON.stringify(site.value)) : null,
      },
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
};

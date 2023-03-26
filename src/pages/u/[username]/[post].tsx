import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Post } from '@entities/Post';
import { Site } from '@entities/Site';
import { connectToDatabase } from '@middleware/database';

// eslint-disable-next-line no-restricted-exports
export { default } from '@pages/.';

export const getServerSideProps: GetServerSideProps = async ({ locale, query }) => {
  await connectToDatabase();

  const [posts, site] = await Promise.allSettled([
    Post.getAllFromUser(query.username as string),
    Site.find(),
  ]);

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

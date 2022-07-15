import { instanceToPlain } from 'class-transformer';
import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { About } from '../components/About';
import { Button } from '../components/Button';
import { useDataStore } from '../components/DataStore';
import { Editor } from '../components/Editor';
import { Gallery } from '../components/Gallery';
import { LightBox } from '../components/LightBox';
import { AuthorizationScopes } from '../entities/Jwt';
import { Post } from '../entities/Post';
import { ReactComponent as Plus } from '../icons/plusSquare.svg';
import { Config } from '../utils/config';
import styles from './home.module.scss';

export const Home: NextPage = () => {
  const { session } = useDataStore();
  const { push } = useRouter();

  return (
    <div className={styles.container}>
      <Head>
        <title>{Config.NEXT_PUBLIC_NAME}</title>
      </Head>

      <Gallery />

      <About />

      {session.hasPermission(AuthorizationScopes.post) && (
        <Button
          className={styles.button}
          onClick={() => push({ query: { newPost: true } }, undefined, { shallow: true })}
          testId="new post"
        >
          <Plus />
        </Button>
      )}

      <LightBox />

      <Editor />
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const posts = await Post.getAll();

  return {
    props: {
      posts: instanceToPlain(posts) as Post[],
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};

export default Home;

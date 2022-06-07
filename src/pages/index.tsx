import { NextPage } from 'next';
import Head from 'next/head';
import { About } from '../components/About';
import { Button } from '../components/Button';
import { useDataStore } from '../components/DataStore';
import { Gallery } from '../components/Gallery';
import { LightBox } from '../components/LightBox';
import { AuthorizationScopes } from '../entities/Jwt';
import { Config } from '../utils/config';
import styles from './home.module.scss';

export const Home: NextPage = () => {
  const { session } = useDataStore();

  return (
    <div className={styles.container}>
      <Head>
        <title>{Config.NEXT_PUBLIC_NAME}</title>
      </Head>

      <Gallery />

      <About />

      {session.hasPermission(AuthorizationScopes.post) && <Button type="fab">New Post</Button>}

      <LightBox />
    </div>
  );
};

export default Home;

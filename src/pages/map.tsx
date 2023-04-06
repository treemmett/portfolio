import { Map as Mapbox } from 'mapbox-gl';
import { GetServerSideProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useRef } from 'react';
import styles from './map.module.scss';
import { Nav } from '@components/Nav';
import { Site } from '@entities/Site';
import { connectToDatabase } from '@middleware/database';
import { Config } from '@utils/config';
import { isDarkMode, listenForDarkModeChange } from '@utils/pixels';

export const getServerSideProps: GetServerSideProps = async ({ locale, req }) => {
  await connectToDatabase();

  let site: Site | null = null;
  if (req.headers.host) {
    site = await Site.getByDomain(req.headers.host).catch(() => null);
  }

  if (!site) {
    site = await Site.getByUsername('tregan');
  }

  return {
    props: {
      fallback: {
        site: JSON.parse(JSON.stringify(site)),
      },
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
};

const Map: NextPage = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Mapbox>();

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new Mapbox({
      accessToken: Config.NEXT_PUBLIC_MAPBOX_TOKEN,
      container: mapContainer.current,
      style: isDarkMode() ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
    });
  }, []);

  useEffect(
    () =>
      listenForDarkModeChange((darkMode) => {
        if (!map.current) return;

        map.current?.setStyle(
          darkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11'
        );
      }),
    []
  );

  return (
    <>
      <Nav className={styles.nav} />

      <div className={styles.map} ref={mapContainer} />
    </>
  );
};

export default Map;

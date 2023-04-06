import 'mapbox-gl/dist/mapbox-gl.css';
import { EventData, LngLat, MapMouseEvent, Map as Mapbox, Marker } from 'mapbox-gl';
import { GetServerSideProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef } from 'react';
import styles from './map.module.scss';
import { Nav } from '@components/Nav';
import { AuthorizationScopes } from '@entities/Jwt';
import { Site } from '@entities/Site';
import { useUser } from '@lib/user';
import { connectToDatabase } from '@middleware/database';
import { Config } from '@utils/config';
import { isDarkMode, listenForDarkModeChange } from '@utils/pixels';
import { toString } from '@utils/queryParam';

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

const DynamicGPSCheckIn = dynamic(() =>
  import('@components/GPSCheckIn').then((mod) => mod.GPSCheckIn)
);

const Map: NextPage = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Mapbox>();
  const { push, query } = useRouter();
  const { hasPermission } = useUser();

  const clickHandler = useCallback(
    (event: MapMouseEvent & EventData) => {
      push({ query: { ...query, lat: event.lngLat.lat, lng: event.lngLat.lng } }, undefined, {
        shallow: true,
      });
    },
    [push, query]
  );

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new Mapbox({
      accessToken: Config.NEXT_PUBLIC_MAPBOX_TOKEN,
      attributionControl: false,
      container: mapContainer.current,
      style: isDarkMode() ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
    });
  }, []);

  useEffect(() => {
    if (map.current) {
      map.current.on('click', clickHandler);
    }

    return () => {
      if (map.current) {
        map.current.off('click', clickHandler);
      }
    };
  }, [clickHandler]);

  useEffect(() => {
    const m = new Marker({ draggable: true });

    if (map.current) {
      if (query.lng && query.lat) {
        const lng = parseFloat(toString(query.lng));
        const lat = parseFloat(toString(query.lat));

        if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
          m.setLngLat(new LngLat(lng, lat)).addTo(map.current);
          m.on('dragend', () => {
            push({ query: { ...query, ...m.getLngLat() } }, undefined, {
              shallow: true,
            });
          });
        }
      }
    }

    return () => {
      m.remove();
    };
  }, [push, query]);

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

      {hasPermission(AuthorizationScopes.post) && <DynamicGPSCheckIn />}
    </>
  );
};

export default Map;

import 'mapbox-gl/dist/mapbox-gl.css';
import { LngLat, LngLatBounds, LngLatLike, Map as Mapbox, Marker } from 'mapbox-gl';
import { GetStaticProps, NextPage } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import styles from './map.module.scss';
import { GPSMarker } from '@entities/GPSMarker';
import { AuthorizationScopes } from '@entities/Jwt';
import { Site } from '@entities/Site';
import { useMarkers } from '@lib/markers';
import { useUser } from '@lib/user';
import { connectToDatabase } from '@middleware/database';
import { Config } from '@utils/config';
import { isDarkMode, listenForDarkModeChange } from '@utils/pixels';

export const getStaticProps: GetStaticProps = async () => {
  await connectToDatabase();

  const site = await Site.getByUsername('tregan');

  const markers = await GPSMarker.getAllForSite(site);

  return {
    props: {
      fallback: {
        [`markers/${site.owner.username}`]: JSON.parse(JSON.stringify(markers)),
        site: JSON.parse(JSON.stringify(site)),
      },
    },
    revalidate: 60,
  };
};

const DynamicGPSCheckIn = dynamic(() =>
  import('@components/GPSCheckIn').then((mod) => mod.GPSCheckIn),
);

const Map: NextPage = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Mapbox>();
  const { markers } = useMarkers();
  const { hasPermission } = useUser();
  const { query } = useRouter();

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new Mapbox({
      accessToken: Config.NEXT_PUBLIC_MAPBOX_TOKEN,
      attributionControl: false,
      container: mapContainer.current,
      style: isDarkMode() ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
    });
  }, []);

  useEffect(
    () =>
      listenForDarkModeChange((darkMode) => {
        if (!map.current) return;

        map.current?.setStyle(
          darkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
        );
      }),
    [],
  );

  useEffect(() => {
    const placedMarkers: Marker[] = [];

    if (map.current && markers) {
      const { current } = map;
      placedMarkers.push(
        ...markers.map((marker) =>
          new Marker().setLngLat(marker.coordinate.coordinates as [number, number]).addTo(current),
        ),
      );

      const lastFourMarkers = markers.slice(0, 4);

      if (!query.lng && !query.lat) {
        if (lastFourMarkers.length >= 2) {
          const lng = lastFourMarkers.map((m) => m.coordinate.coordinates[0]);
          const lat = lastFourMarkers.map((m) => m.coordinate.coordinates[1]);
          const sw = new LngLat(Math.min(...lng), Math.min(...lat));
          const ne = new LngLat(Math.max(...lng), Math.max(...lat));

          map.current.fitBounds(new LngLatBounds(sw, ne), { padding: 100 });
        } else if (lastFourMarkers.length === 1) {
          map.current.setCenter(lastFourMarkers[0].coordinate.coordinates as LngLatLike);
          map.current.zoomTo(5);
        }
      }
    }

    return () => {
      placedMarkers?.forEach((m) => m.remove());
    };
  }, [markers, query.lat, query.lng]);

  return (
    <>
      <div className={styles.map} ref={mapContainer} />

      {hasPermission(AuthorizationScopes.post) && <DynamicGPSCheckIn map={map.current} />}
    </>
  );
};

export default Map;

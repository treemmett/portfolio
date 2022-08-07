import 'mapbox-gl/dist/mapbox-gl.css';
import lineString from '@turf/bezier-spline';
import { LngLat, LngLatBounds, Map, Marker } from 'mapbox-gl';
import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useRef, useState } from 'react';
import { WithAbout } from '../components/About';
import { DataStoreDefaults, useDataStore } from '../components/DataStore';
import { Marker as MarkerEntity } from '../entities/Marker';
import { apiClient } from '../utils/apiClient';
import { Config } from '../utils/config';
import { isDarkMode, listenForDarkModeChange } from '../utils/pixels';
import styles from './timeline.module.scss';

export const getStaticProps: GetStaticProps<DataStoreDefaults> = async ({ locale }) => {
  const markers = await MarkerEntity.getAll();

  return {
    props: {
      markers,
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};

const Timeline: NextPage = () => {
  const [darkMode, setDarkMode] = useState(isDarkMode());
  useEffect(() => listenForDarkModeChange(setDarkMode), []);

  const { addMarker, markers } = useDataStore();
  const mapContainer = useRef<HTMLDivElement>();
  const map = useRef<Map>();
  useEffect(() => {
    if (mapContainer.current) {
      const getBounds = (): LngLatBounds => {
        const sw = new LngLat(markers[0].lng, markers[0].lat);
        const ne = new LngLat(markers[0].lng, markers[0].lat);
        markers.forEach((lngLat) => {
          if (ne.lng < lngLat.lng) {
            ne.lng = lngLat.lng;
          }

          if (ne.lat < lngLat.lat) {
            ne.lat = lngLat.lat;
          }

          if (sw.lng > lngLat.lng) {
            sw.lng = lngLat.lng;
          }

          if (sw.lat > lngLat.lat) {
            sw.lat = lngLat.lat;
          }
        });

        return new LngLatBounds(sw, ne);
      };

      map.current = new Map({
        accessToken: Config.NEXT_PUBLIC_MAPBOX_TOKEN,
        attributionControl: false,
        bounds: markers.length ? getBounds() : undefined,
        center: markers.length ? undefined : [-70.9, 42.35],
        container: mapContainer.current,
        fitBoundsOptions: {
          padding: 50,
        },
        style: `mapbox://styles/mapbox/${darkMode ? 'dark' : 'light'}-v10`,
        zoom: 9,
      })
        .on('load', () => {
          map.current.addSource('route', {
            data: lineString({
              coordinates: markers.map((m) => [m.lng, m.lat]),
              type: 'LineString',
            }),
            type: 'geojson',
          });
          map.current.addLayer({
            id: 'route',
            layout: {
              'line-cap': 'round',
              'line-join': 'round',
            },
            paint: {
              'line-color': '#888',
              'line-width': 2,
            },
            source: 'route',
            type: 'line',
          });
        })
        .on('click', async ({ lngLat }) => {
          new Marker().setLngLat(lngLat).addTo(map.current);
          const { data } = await apiClient.post<MarkerEntity>('/timeline', lngLat);
          await addMarker(data);
        });

      markers.forEach((lngLat) => {
        new Marker().setLngLat(lngLat).addTo(map.current);
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [addMarker, darkMode, map, markers]);

  return (
    <WithAbout className={styles.timeline}>
      <div className={styles.map} id="map" ref={mapContainer} />
    </WithAbout>
  );
};

export default Timeline;

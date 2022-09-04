import 'mapbox-gl/dist/mapbox-gl.css';
import lineString from '@turf/bezier-spline';
import { LngLatBounds, LngLatLike, Map, MapMouseEvent, Marker } from 'mapbox-gl';
import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useCallback, useEffect, useRef, useState } from 'react';
import { WithAbout } from '../components/About';
import { Button } from '../components/Button';
import { DefaultState, useDataStore } from '../components/DataStore';
import { AuthorizationScopes } from '../entities/Jwt';
import { Marker as MarkerEntity } from '../entities/Marker';
import { ReactComponent as Plus } from '../icons/plus-square.svg';
import { ReactComponent as X } from '../icons/x-square.svg';
import { apiClient } from '../utils/apiClient';
import { Config } from '../utils/config';
import { isDarkMode, listenForDarkModeChange } from '../utils/pixels';
import styles from './timeline.module.scss';

export interface TimelineProps {
  ne: LngLatLike;
  sw: LngLatLike;
}

export const getStaticProps: GetStaticProps<DefaultState & TimelineProps> = async ({ locale }) => {
  const markers = await MarkerEntity.getAll();

  const ne: LngLatLike = markers.length
    ? { lat: markers[0].lat, lng: markers[0].lng }
    : { lat: 42.35, lng: -70.9 };
  const sw = { ...ne };
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

  return {
    props: {
      markers,
      ne,
      sw,
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};

const Timeline: NextPage<TimelineProps> = ({ ne, sw }) => {
  const { session } = useDataStore();
  const [darkMode, setDarkMode] = useState(isDarkMode());
  const [selecting, setSelecting] = useState(false);
  useEffect(() => listenForDarkModeChange(setDarkMode), []);

  const { dispatch, markers } = useDataStore();
  const mapContainer = useRef<HTMLDivElement>();
  const map = useRef<Map>();
  useEffect(() => {
    if (mapContainer.current) {
      map.current = new Map({
        accessToken: Config.NEXT_PUBLIC_MAPBOX_TOKEN,
        attributionControl: false,
        bounds: new LngLatBounds(sw, ne),
        center: markers.length ? undefined : [-70.9, 42.35],
        container: mapContainer.current,
        fitBoundsOptions: {
          padding: 50,
        },
        style: `mapbox://styles/mapbox/${darkMode ? 'dark' : 'light'}-v10`,
        zoom: 9,
      }).on('load', () => {
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
  }, [darkMode, dispatch, map, markers, ne, sw]);

  const mapClickHandler = useCallback(
    async ({ lngLat }: MapMouseEvent) => {
      new Marker().setLngLat(lngLat).addTo(map.current);
      const { data } = await apiClient.post<MarkerEntity>('/timeline', lngLat);
      dispatch({
        marker: data,
        type: 'ADD_MARKER',
      });
    },
    [dispatch]
  );

  useEffect(() => {
    if (selecting && map.current) {
      map.current.on('click', mapClickHandler);
    }

    return () => {
      if (map.current) {
        map.current.off('click', mapClickHandler);
      }
    };
  }, [map, mapClickHandler, selecting]);

  return (
    <WithAbout className={styles.timeline}>
      <div className={styles.map} id="map" ref={mapContainer} />

      {session.hasPermission(AuthorizationScopes.post) && (
        <Button
          className={styles.button}
          inverted={selecting}
          onClick={() => setSelecting(!selecting)}
          testId="new post"
        >
          {selecting ? <X /> : <Plus />}
        </Button>
      )}
    </WithAbout>
  );
};

export default Timeline;

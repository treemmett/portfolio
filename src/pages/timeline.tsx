import 'mapbox-gl/dist/mapbox-gl.css';
import lineString from '@turf/bezier-spline';
import {
  GeoJSONSource,
  LngLat,
  LngLatBounds,
  LngLatLike,
  Map,
  MapMouseEvent,
  Marker,
} from 'mapbox-gl';
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
  useEffect(() => listenForDarkModeChange(setDarkMode), []);

  const { dispatch, markers } = useDataStore();
  const mapContainer = useRef<HTMLDivElement>();
  const map = useRef<Map>();
  const [mapLoaded, setMapLoaded] = useState(false);
  useEffect(() => {
    if (mapContainer.current) {
      map.current = new Map({
        accessToken: Config.NEXT_PUBLIC_MAPBOX_TOKEN,
        attributionControl: false,
        bounds: new LngLatBounds(sw, ne),
        container: mapContainer.current,
        fitBoundsOptions: {
          padding: 50,
        },
        style: `mapbox://styles/mapbox/${darkMode ? 'dark' : 'light'}-v10`,
        zoom: 9,
      })
        .on('load', () => setMapLoaded(true))
        .on('remove', () => setMapLoaded(false));
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [darkMode, dispatch, map, ne, sw]);

  const [selecting, setSelecting] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<LngLat>();

  const mapClickHandler = useCallback(({ lngLat }: MapMouseEvent) => {
    setSelectedCoordinates(lngLat);
  }, []);
  useEffect(() => {
    let marker: Marker;
    if (selectedCoordinates) {
      marker = new Marker({ color: '#CF5D40' }).setLngLat(selectedCoordinates).addTo(map.current);
      map.current.flyTo({ center: selectedCoordinates, zoom: 8 });
    }

    return () => {
      if (marker) {
        marker.remove();
      }
    };
  }, [selectedCoordinates]);

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

  useEffect(() => {
    const markersOnMap: Marker[] = [];
    if (map.current && mapLoaded && markers.length) {
      markers.forEach((lngLat) => {
        markersOnMap.push(new Marker().setLngLat(lngLat).addTo(map.current));
      });

      if (markers.length >= 2) {
        const existingSource = map.current.getSource('route') as GeoJSONSource;
        const data = lineString(
          {
            coordinates: markers.map((m) => [m.lng, m.lat]),
            type: 'LineString',
          },
          {
            sharpness: 0.4,
          }
        );

        if (existingSource) {
          existingSource.setData(data);
        } else {
          map.current.addSource('route', {
            data,
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
        }
      }
    }

    return () => {
      if (map.current && mapLoaded) {
        markersOnMap.forEach((marker) => marker.remove());
      }
    };
  }, [markers, mapLoaded]);

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

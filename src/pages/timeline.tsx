import 'mapbox-gl/dist/mapbox-gl.css';
import lineString from '@turf/bezier-spline';
import { LngLat, LngLatBounds, Map, Marker } from 'mapbox-gl';
import { GetStaticProps, NextPage } from 'next';
import { useEffect, useRef } from 'react';
import { WithAbout } from '../components/About';
import { DataStoreDefaults, useDataStore } from '../components/DataStore';
import { Marker as MarkerEntity } from '../entities/Marker';
import { Config } from '../utils/config';
import styles from './timeline.module.scss';

export const getStaticProps: GetStaticProps<DataStoreDefaults> = async () => {
  const markers = await MarkerEntity.getAll();

  return {
    props: {
      markers,
    },
  };
};

const Timeline: NextPage = () => {
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
        style: 'mapbox://styles/mapbox/dark-v10',
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
          await addMarker(lngLat);
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
  }, [addMarker, map, markers]);

  return (
    <WithAbout className={styles.timeline}>
      <div className={styles.map} id="map" ref={mapContainer} />
    </WithAbout>
  );
};

export default Timeline;

import 'mapbox-gl/dist/mapbox-gl.css';
import { LngLat, LngLatBounds, Map, Marker } from 'mapbox-gl';
import { NextPage } from 'next';
import { useEffect, useRef } from 'react';
import { useDataStore } from '../components/DataStore';
import { Config } from '../utils/config';
import styles from './timeline.module.scss';

const MARKERS_KEY = 'markers';

function getMarkers(): LngLat[] {
  const storage = localStorage.getItem(MARKERS_KEY);
  return storage ? JSON.parse(storage) : [];
}

const Timeline: NextPage = () => {
  const { addMarker } = useDataStore();
  const mapContainer = useRef<HTMLDivElement>();
  const map = useRef<Map>();
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      const markers = getMarkers();

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
      });

      markers.forEach((lngLat) => {
        new Marker().setLngLat(lngLat).addTo(map.current);
      });

      map.current.on('click', async ({ lngLat }) => {
        new Marker().setLngLat(lngLat).addTo(map.current);
        await addMarker(lngLat);
      });
    }
  }, [addMarker, map]);

  useEffect(() => {
    const handler = () => {
      if (map.current) {
        if (mapContainer.current.clientHeight < map.current.getCanvasContainer().clientHeight) {
          map.current.resize();
        }
      }
    };

    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  });

  return (
    <div className={styles.timeline}>
      <div className={styles.map} id="map" ref={mapContainer} />
    </div>
  );
};

export default Timeline;

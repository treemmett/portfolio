import 'mapbox-gl/dist/mapbox-gl.css';
import { LngLat, Map, Marker } from 'mapbox-gl';
import { NextPage } from 'next';
import { useEffect, useRef } from 'react';
import { Config } from '../utils/config';
import styles from './timeline.module.scss';

const MARKERS_KEY = 'markers';

function getMarkers(): LngLat[] {
  const storage = localStorage.getItem(MARKERS_KEY);
  return storage ? JSON.parse(storage) : [];
}

const Timeline: NextPage = () => {
  const mapContainer = useRef<HTMLDivElement>();
  const map = useRef<Map>();
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new Map({
        accessToken: Config.NEXT_PUBLIC_MAPBOX_TOKEN,
        attributionControl: false,
        center: [-70.9, 42.35],
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v10',
        zoom: 9,
      });

      map.current.on('click', (e) => {
        const markers = getMarkers();
        markers.push(e.lngLat);
        new Marker().setLngLat(e.lngLat).addTo(map.current);
        localStorage.setItem(MARKERS_KEY, JSON.stringify(markers));
      });

      getMarkers().forEach((lngLat) => {
        new Marker().setLngLat(lngLat).addTo(map.current);
      });
    }
  }, [map]);

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

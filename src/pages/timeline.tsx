import { Map } from 'mapbox-gl';
import { NextPage } from 'next';
import { useEffect, useRef } from 'react';
import { Config } from '../utils/config';
import styles from './timeline.module.scss';

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

      map.current.resize();
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

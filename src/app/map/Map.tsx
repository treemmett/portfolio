'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import { GpsMarker } from '@prisma/client';
import { LngLat, LngLatBounds, Map as Mapbox, Marker } from 'mapbox-gl';
import dynamic from 'next/dynamic';
import { FC, useEffect, useRef } from 'react';
import { AuthorizationScopes } from '@app/scopes';
import { useUser } from '@lib/user';
import { Config } from '@utils/config';
import { isDarkMode, listenForDarkModeChange } from '@utils/pixels';

const DynamicCheckIn = dynamic(() => import('./GPSCheckIn').then((m) => m.GPSCheckIn));

const Map: FC<{ markers: GpsMarker[] }> = ({ markers }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Mapbox>();
  const { hasPermission } = useUser();

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
          new Marker().setLngLat([marker.longitude, marker.latitude]).addTo(current),
        ),
      );

      const lastFourMarkers = markers.slice(0, 4);

      if (lastFourMarkers.length >= 2) {
        const lng = lastFourMarkers.map((m) => m.longitude);
        const lat = lastFourMarkers.map((m) => m.latitude);
        const sw = new LngLat(Math.min(...lng), Math.min(...lat));
        const ne = new LngLat(Math.max(...lng), Math.max(...lat));

        map.current.fitBounds(new LngLatBounds(sw, ne), { padding: 100 });
      } else if (lastFourMarkers.length === 1) {
        map.current.setCenter([lastFourMarkers[0].longitude, lastFourMarkers[0].latitude]);
        map.current.zoomTo(5);
      }
    }

    return () => {
      placedMarkers?.forEach((m) => m.remove());
    };
  }, [markers]);

  return (
    <>
      {hasPermission(AuthorizationScopes.post) && <DynamicCheckIn map={map.current} />}
      <div className="h-screen" ref={mapContainer} />
    </>
  );
};

export default Map;

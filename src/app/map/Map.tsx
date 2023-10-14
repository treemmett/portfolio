'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import { GpsMarker } from '@prisma/client';
import { LngLat, LngLatBounds, Map as Mapbox, Marker } from 'mapbox-gl';
import dynamic from 'next/dynamic';
import { FC, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GitBranch } from 'react-feather';
import { MapMarker } from './MapMarker';
import { MapProvider } from './context';
import { AuthorizationScopes } from '@app/scopes';
import { useUser } from '@lib/user';
import { Config } from '@utils/config';
import { isDarkMode, listenForDarkModeChange } from '@utils/pixels';
import { useTranslation } from '@utils/translation';

const DynamicCheckIn = dynamic(() => import('./GPSCheckIn').then((m) => m.GPSCheckIn));

const Map: FC<{ markers: GpsMarker[] }> = ({ markers }) => {
  const { t } = useTranslation();
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

  const [placedMarkers, setPlacedMarkers] = useState<{ marker: Marker; checkIn: GpsMarker }[]>([]);
  useEffect(() => {
    const markersToAdd: typeof placedMarkers = [];

    if (map.current && markers) {
      const { current } = map;
      const coordinates: [number, number][] = [];
      markersToAdd.push(
        ...markers.map((marker) => {
          coordinates.push([marker.longitude, marker.latitude]);

          return {
            checkIn: marker,
            marker: new Marker({ anchor: 'bottom', element: document.createElement('div') })
              .setLngLat([marker.longitude, marker.latitude])
              .addTo(current),
          };
        }),
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

      setPlacedMarkers(markersToAdd);

      map.current.on('load', ({ target }) => {
        if (target.getSource('route')) {
          return;
        }

        target.addSource('route', {
          data: {
            geometry: {
              coordinates,
              type: 'LineString',
            },
            properties: {},
            type: 'Feature',
          },
          type: 'geojson',
        });
        target.addLayer({
          id: 'route',
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
            visibility: 'none',
          },
          paint: {
            'line-color': '#fff',
          },
          source: 'route',
          type: 'line',
        });
      });
    }

    return () => {
      markersToAdd?.forEach((m) => m.marker.remove());
    };
  }, [markers]);

  const [showRoute, setShowRoute] = useState(false);
  useEffect(() => {
    if (map.current?.loaded && map.current?.isStyleLoaded()) {
      map.current?.setLayoutProperty('route', 'visibility', showRoute ? 'visible' : 'none');
    }
  }, [showRoute]);

  return (
    <MapProvider>
      {placedMarkers.map(({ checkIn, marker }) =>
        createPortal(<MapMarker marker={checkIn} />, marker.getElement()),
      )}
      <div className="h-screen" ref={mapContainer} />
      <div className="fixed bottom-4 right-4 z-10 flex flex-col gap-2 p-2">
        <button
          className="button action flex items-center gap-1 p-2"
          onClick={() => setShowRoute(!showRoute)}
        >
          <GitBranch strokeWidth={1} />
          <div className="hidden sm:block">{showRoute ? t('Hide route') : t('Show route')}</div>
        </button>
        {hasPermission(AuthorizationScopes.post) && <DynamicCheckIn map={map.current} />}
      </div>
    </MapProvider>
  );
};

export default Map;

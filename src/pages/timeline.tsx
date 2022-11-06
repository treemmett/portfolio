import 'mapbox-gl/dist/mapbox-gl.css';
import type { GeoJSONSource, LngLatLike, Map as MapType, Marker as MarkerType } from 'mapbox-gl';
import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import styles from './timeline.module.scss';
import { DefaultState, useDataStore } from '@components/DataStore';
import { AuthorizationScopes } from '@entities/Jwt';
import { Marker as MarkerEntity } from '@entities/Marker';
import { Country } from '@lib/countryCodes';
import { countryFlags } from '@lib/countryFlags';
import { boundingCoordinates } from '@utils/boundingCoordinates';
import { splitCase } from '@utils/casing';
import { Config } from '@utils/config';
import {
  Breakpoint,
  getBreakpoint,
  getRemValue,
  isDarkMode,
  listenForDarkModeChange,
} from '@utils/pixels';

export interface TimelineProps {
  countries: { country: Country; flag: string; name: string }[];
  ne: LngLatLike;
  sw: LngLatLike;
}

export const getStaticProps: GetStaticProps<DefaultState & TimelineProps> = async ({ locale }) => {
  const markers = await MarkerEntity.getAll();

  const { sw, ne } = boundingCoordinates(markers);

  // filter country flags to avoid sending massive payload to client
  const countryMappings = Object.fromEntries(Object.entries(Country).map((a) => a.reverse()));
  const countries = Object.entries(countryFlags)
    .reduce((acc, [country, flag]: [Country, string]) => {
      if (~markers.findIndex((m) => m.country === country)) {
        acc.push({
          country,
          flag,
          name: splitCase(countryMappings[country]),
        });
      }

      return acc;
    }, [] as TimelineProps['countries'])
    .sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
      return 0;
    });

  return {
    props: {
      countries,
      markers,
      ne,
      sw,
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};

const DynamicCheckIn = dynamic(() => import('@components/CheckIn').then((mod) => mod.CheckIn));

const Timeline: NextPage<TimelineProps> = ({ countries }) => {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(isDarkMode());
  useEffect(() => listenForDarkModeChange(setDarkMode), []);
  const { markers, session } = useDataStore();
  const mapContainer = useRef<HTMLDivElement>();
  const listContainer = useRef<HTMLDivElement>();
  const map = useRef<MapType>();
  const [mapLoaded, setMapLoaded] = useState(false);

  const initializeMap = useCallback(async () => {
    const { Map } = await import('mapbox-gl');

    const latestMarker = markers[markers.length - 1];

    map.current = new Map({
      accessToken: Config.NEXT_PUBLIC_MAPBOX_TOKEN,
      attributionControl: false,
      center: { lat: latestMarker.lat, lng: latestMarker.lng },
      container: mapContainer.current,
      fitBoundsOptions: {
        padding: {
          bottom:
            (getBreakpoint() > Breakpoint.sm
              ? 0
              : listContainer.current.getBoundingClientRect().top) +
            getRemValue() * 2,
          left:
            (getBreakpoint() > Breakpoint.sm
              ? listContainer.current.getBoundingClientRect().right
              : 0) +
            getRemValue() * 2,
          right: getRemValue() * 2,
          top: getRemValue() * 2,
        },
      },
      style: `mapbox://styles/mapbox/${darkMode ? 'dark' : 'light'}-v10`,
      zoom: 8,
    })
      .on('load', () => setMapLoaded(true))
      .on('remove', () => setMapLoaded(false));
  }, [darkMode, markers]);

  useEffect(() => {
    if (mapContainer.current) {
      initializeMap();
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [initializeMap]);

  const placeMarkers = useCallback(async () => {
    const markersOnMap: MarkerType[] = [];
    if (map.current && mapLoaded && markers.length) {
      const { Marker } = await import('mapbox-gl');

      markers.forEach(({ lat, lng, id }) => {
        const marker = new Marker().setLngLat({ lat, lng }).addTo(map.current);
        markersOnMap.push(marker);

        if (session.hasPermission(AuthorizationScopes.post)) {
          marker.getElement().addEventListener('click', () => {
            router.push({ query: { edit: id } }, undefined, { shallow: true });
          });
        }
      });

      if (markers.length >= 2) {
        const existingRouteSource = map.current.getSource('route') as GeoJSONSource;
        const routeData: GeoJSON.Feature = {
          geometry: {
            coordinates: markers.map((m) => [m.lng, m.lat]),
            type: 'LineString',
          },
          properties: {},
          type: 'Feature',
        };

        if (existingRouteSource) {
          existingRouteSource.setData(routeData);
        } else if (map.current.loaded) {
          map.current.addSource('route', {
            data: routeData,
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
    return markersOnMap;
  }, [mapLoaded, router, markers, session]);

  useEffect(() => {
    let markersPlaced: MarkerType[] = [];
    placeMarkers().then((m) => {
      markersPlaced = m;
    });

    return () => {
      markersPlaced.forEach((marker) => marker.remove());
    };
  }, [placeMarkers]);

  const focusMarkersInCountry = useCallback(
    (country: string) => {
      const countryMarkers = markers.filter((marker) => marker.country === country);

      if (countryMarkers.length === 1) {
        const [{ lat, lng }] = countryMarkers;
        map.current.flyTo({ center: [lng, lat], zoom: 9 });
      } else {
        const { sw: s, ne: n } = boundingCoordinates(countryMarkers);
        map.current.fitBounds([s, n], { padding: 100 });
      }
    },
    [markers]
  );

  return (
    <>
      <div className={styles.map} id="map" ref={mapContainer} />

      <div className={styles.list} ref={listContainer}>
        {countries.map(({ country, flag, name }) => (
          <button
            className={styles.country}
            key={country}
            onClick={() => focusMarkersInCountry(country)}
            onKeyDown={(e) => e.key === 'Enter' && focusMarkersInCountry(country)}
            type="button"
          >
            {flag} {name}
          </button>
        ))}
      </div>

      {session.hasPermission(AuthorizationScopes.post) && (
        <Suspense fallback="Loading...">
          <DynamicCheckIn map={map} />
        </Suspense>
      )}
    </>
  );
};

export default Timeline;

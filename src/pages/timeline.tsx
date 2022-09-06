import 'mapbox-gl/dist/mapbox-gl.css';
import { GeoJSONSource, LngLatBounds, LngLatLike, Map, Marker } from 'mapbox-gl';
import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Suspense, useEffect, useRef, useState } from 'react';
import { DefaultState, useDataStore } from '../components/DataStore';
import { AuthorizationScopes } from '../entities/Jwt';
import { Marker as MarkerEntity } from '../entities/Marker';
import { Country } from '../lib/countryCodes';
import { countryFlags } from '../lib/countryFlags';
import { splitCase } from '../utils/casing';
import { Config } from '../utils/config';
import { getRemValue, isDarkMode, listenForDarkModeChange } from '../utils/pixels';
import styles from './timeline.module.scss';

export interface TimelineProps {
  countries: { country: Country; flag: string; name: string }[];
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

const DynamicCheckIn = dynamic(() => import('../components/CheckIn').then((mod) => mod.CheckIn));

const Timeline: NextPage<TimelineProps> = ({ countries, ne, sw }) => {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(isDarkMode());
  useEffect(() => listenForDarkModeChange(setDarkMode), []);
  const { dispatch, markers, session } = useDataStore();
  const mapContainer = useRef<HTMLDivElement>();
  const listContainer = useRef<HTMLDivElement>();
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
          padding: {
            bottom: getRemValue() * 5,
            left: listContainer.current.getBoundingClientRect().right + getRemValue() * 5,
            right: getRemValue() * 5,
            top: getRemValue() * 5,
          },
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
  useEffect(() => {
    const markersOnMap: Marker[] = [];
    if (map.current && mapLoaded && markers.length) {
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
        const existingSource = map.current.getSource('route') as GeoJSONSource;
        const data: GeoJSON.Feature = {
          geometry: {
            coordinates: markers.map((m) => [m.lng, m.lat]),
            type: 'LineString',
          },
          properties: {},
          type: 'Feature',
        };

        if (existingSource) {
          existingSource.setData(data);
        } else if (map.current.loaded) {
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
  }, [markers, mapLoaded, router, session]);

  return (
    <>
      <div className={styles.map} id="map" ref={mapContainer} />

      <div className={styles.list} ref={listContainer}>
        {countries.map(({ country, flag, name }) => (
          <div key={country}>
            {flag} {name}
          </div>
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

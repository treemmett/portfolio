import { EventData, LngLat, MapMouseEvent, Map as Mapbox, Marker } from 'mapbox-gl';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { FC, FormEvent, useCallback, useEffect, useState } from 'react';
import { Button } from './Button';
import styles from './GPSCheckIn.module.scss';
import { Input } from './Input';
import { geocode } from '@lib/geocode';
import { useMarkers } from '@lib/markers';
import { toLocalString } from '@utils/date';
import { toString } from '@utils/queryParam';

export const GPSCheckIn: FC<{ map?: Mapbox }> = ({ map }) => {
  const { t } = useTranslation();
  const { addMarker, isMutating } = useMarkers();
  const { push, query, replace } = useRouter();
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [date, setDate] = useState(new Date());

  const close = useCallback(() => {
    const q = { ...query };
    delete q.lng;
    delete q.lat;
    push({ query: q }, undefined, { shallow: true });
    setCity('');
    setCountry('');
    setDate(new Date());
  }, [push, query]);

  const save = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!query.lng || !query.lat) {
        return;
      }

      addMarker({
        city,
        country,
        date,
        lat: parseFloat(toString(query.lat)),
        lng: parseFloat(toString(query.lng)),
      });

      close();
    },
    [addMarker, city, close, country, date, query.lat, query.lng]
  );

  const mapClickHandler = useCallback(
    (event: MapMouseEvent & EventData) => {
      push({ query: { ...query, lat: event.lngLat.lat, lng: event.lngLat.lng } }, undefined, {
        shallow: true,
      });
    },
    [push, query]
  );

  useEffect(() => {
    if (map) {
      map.on('click', mapClickHandler);
    }

    return () => {
      if (map) {
        map.off('click', mapClickHandler);
      }
    };
  }, [map, mapClickHandler]);

  useEffect(() => {
    const m = new Marker({ draggable: true });

    if (map) {
      if (query.lng && query.lat) {
        const lng = parseFloat(toString(query.lng));
        const lat = parseFloat(toString(query.lat));

        if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
          m.setLngLat(new LngLat(lng, lat)).addTo(map);
          m.on('dragend', () => {
            push({ query: { ...query, ...m.getLngLat() } }, undefined, {
              shallow: true,
            });
          });
        }
      }
    }

    return () => {
      m.remove();
    };
  }, [map, push, query]);

  useEffect(() => {
    if (query.lng && query.lat) {
      setLoadingGeo(true);
      geocode(toString(query.lng), toString(query.lat))
        .then((data) => {
          setCity(data.city || '');
          setCountry(data.country_code || '');
        })
        .catch(() => {
          setCity('');
          setCountry('');
        })
        .finally(() => {
          setLoadingGeo(false);
        });
    }
  }, [query.lat, query.lng]);

  if (!query.lng || !query.lat) return null;

  return (
    <form className={styles.form} onSubmit={save}>
      <Input
        label={t('Longitude')}
        onChange={(e) =>
          replace({ query: { ...query, lng: e.currentTarget.value } }, undefined, { shallow: true })
        }
        step={0.0000001}
        type="number"
        value={toString(query.lng)}
      />
      <Input
        label={t('Latitude')}
        onChange={(e) =>
          replace({ query: { ...query, lat: e.currentTarget.value } }, undefined, { shallow: true })
        }
        step={0.0000001}
        type="number"
        value={toString(query.lat)}
      />
      <Input
        disabled={loadingGeo}
        label={t('City')}
        onChange={(e) => setCity(e.currentTarget.value)}
        value={city}
      />
      <Input
        disabled={loadingGeo}
        label={t('Country')}
        onChange={(e) => setCountry(e.currentTarget.value)}
        value={country}
      />
      <Input
        label={t('Date')}
        onChange={(e) => setDate(new Date(e.currentTarget.value))}
        type="datetime-local"
        value={toLocalString(date)}
      />
      <Button disabled={isMutating} type="success" submit>
        {isMutating ? `${t('Saving')}...` : t('Save')}
      </Button>
      <Button disabled={isMutating} onClick={close} type="danger">
        {t('Cancel')}
      </Button>
    </form>
  );
};

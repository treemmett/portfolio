import { useRouter } from 'next/router';
import { FC, FormEvent, useCallback, useEffect, useState } from 'react';
import { Button } from './Button';
import styles from './GPSCheckIn.module.scss';
import { Input } from './Input';
import { geocode } from '@lib/geocode';
import { apiClient } from '@utils/apiClient';
import { toLocalString } from '@utils/date';
import { toString } from '@utils/queryParam';

export const GPSCheckIn: FC = () => {
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

      await apiClient.post('/marker', {
        city,
        country,
        date,
        lat: toString(query.lat),
        lng: toString(query.lng),
      });

      close();
    },
    [city, close, country, date, query.lat, query.lng]
  );

  useEffect(() => {
    if (query.lng && query.lat) {
      setLoadingGeo(true);
      geocode(toString(query.lng), toString(query.lat))
        .then((data) => {
          setCity(data.city);
          setCountry(data.country_code);
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
        label="Longitude"
        onChange={(e) =>
          replace({ query: { ...query, lng: e.currentTarget.value } }, undefined, { shallow: true })
        }
        step={0.0000001}
        type="number"
        value={toString(query.lng)}
      />
      <Input
        label="Latitude"
        onChange={(e) =>
          replace({ query: { ...query, lat: e.currentTarget.value } }, undefined, { shallow: true })
        }
        step={0.0000001}
        type="number"
        value={toString(query.lat)}
      />
      <Input
        disabled={loadingGeo}
        label="City"
        onChange={(e) => setCity(e.currentTarget.value)}
        value={city}
      />
      <Input
        disabled={loadingGeo}
        label="Country"
        onChange={(e) => setCountry(e.currentTarget.value)}
        value={country}
      />
      <Input
        label="Date"
        onChange={(e) => setDate(new Date(e.currentTarget.value))}
        type="datetime-local"
        value={toLocalString(date)}
      />
      <Button type="success" submit>
        Save
      </Button>
      <Button onClick={close} type="danger">
        Cancel
      </Button>
    </form>
  );
};

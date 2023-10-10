import { EventData, LngLat, MapMouseEvent, Map as Mapbox, Marker } from 'mapbox-gl';
import { FC, FormEvent, useCallback, useEffect, useState } from 'react';
import { MapPin } from 'react-feather';
import { checkIn } from './actions';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { geocode } from '@lib/geocode';
import { toLocalString } from '@utils/date';
import { useTranslation } from '@utils/translation';

export const GPSCheckIn: FC<{ map?: Mapbox }> = ({ map }) => {
  const { t } = useTranslation();
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [date, setDate] = useState(new Date());
  const [lngLat, setLngLat] = useState<LngLat>();

  const close = useCallback(() => {
    setCity('');
    setCountry('');
    setDate(new Date());
    setLngLat(undefined);
  }, []);

  const save = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!lngLat) {
        return;
      }

      await checkIn(lngLat.lng, lngLat.lat, city, country, date);

      close();
    },
    [city, close, country, date, lngLat],
  );

  const mapClickHandler = useCallback((event: MapMouseEvent & EventData) => {
    setLngLat(event.lngLat);
  }, []);

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

    if (map && lngLat) {
      const { lng, lat } = lngLat;

      if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
        const coords = new LngLat(lng, lat);

        m.setLngLat(coords)
          .addTo(map)
          .on('dragend', () => {
            setLngLat(m.getLngLat());
          });

        map.setCenter(coords).setZoom(13);
      }
    }

    return () => {
      m.remove();
    };
  }, [map, lngLat]);

  useEffect(() => {
    if (lngLat) {
      setLoadingGeo(true);
      geocode(lngLat.lng.toString(), lngLat.lat.toString())
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
  }, [lngLat, map]);

  const [gettingGPS, setGettingGPS] = useState(false);

  return (
    <>
      <Button
        className="!fixed bottom-4 right-4 z-10"
        disabled={gettingGPS}
        onClick={() => {
          setGettingGPS(true);
          navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
              setGettingGPS(false);
              setLngLat(new LngLat(coords.longitude, coords.latitude));
            },
            () => {
              setGettingGPS(false);
            },
          );
        }}
      >
        <MapPin className="h-6" />
      </Button>

      {lngLat && (
        <form
          className="fixed bottom-8 right-8 z-10 rounded-lg p-4 backdrop-blur-sm dark:bg-zinc-900/50"
          onSubmit={save}
        >
          <Input
            label={t('Longitude')}
            onChange={(e) => setLngLat(new LngLat(parseFloat(e.currentTarget.value), lngLat.lat))}
            step={0.0000001}
            type="number"
            value={lngLat?.lng.toString()}
          />
          <Input
            label={t('Latitude')}
            onChange={(e) => setLngLat(new LngLat(lngLat.lng, parseFloat(e.currentTarget.value)))}
            step={0.0000001}
            type="number"
            value={lngLat?.lat.toString()}
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
          <Button type="success" submit>
            {t('Save')}
          </Button>
          <Button onClick={close} type="danger">
            {t('Cancel')}
          </Button>
        </form>
      )}
    </>
  );
};

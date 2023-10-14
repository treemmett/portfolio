import { useForm } from '@mantine/form';
import { GpsMarker } from '@prisma/client';
import { EventData, LngLat, MapMouseEvent, Map as Mapbox, Marker } from 'mapbox-gl';
import { FC, useCallback, useEffect, useState } from 'react';
import { MapPin } from 'react-feather';
import { checkIn, deleteCheckIn, updateCheckIn } from './actions';
import { useMap } from './context';
import { CheckBox } from '@components/CheckBox';
import { Input } from '@components/Input';
import { openConfirmModal } from '@components/ModalManager';
import { Spinner } from '@components/Spinner';
import { geocode } from '@lib/geocode';
import { useTranslation } from '@utils/translation';

const CheckInForm: FC<{
  lngLat: LngLat | null;
  markerToEdit: null | GpsMarker;
  onClose: () => void;
}> = ({ lngLat, markerToEdit, onClose }) => {
  const { t } = useTranslation();

  const { getInputProps, onSubmit, setValues, values } = useForm({
    initialValues: markerToEdit || {
      city: '',
      country: '',
      crossAntiMeridian: false,
      date: new Date(),
      latitude: lngLat?.lat || 0,
      longitude: lngLat?.lng || 0,
    },
    validate: {
      latitude: (value) => {
        if (!value) return t('Latitude is required.');
      },
      longitude: (value) => {
        if (!value) return t('Longitude is required.');
      },
    },
  });

  useEffect(() => {
    if (markerToEdit) {
      setValues(markerToEdit);
    }
  }, [setValues, markerToEdit]);

  useEffect(() => {
    if (lngLat) {
      setValues({
        latitude: lngLat.lat,
        longitude: lngLat.lng,
      });
    }
  }, [lngLat, setValues]);

  const [loadingGeo, setLoadingGeo] = useState(false);
  useEffect(() => {
    if (values.longitude && values.latitude) {
      setLoadingGeo(true);
      geocode(values.longitude.toString(), values.latitude.toString())
        .then((data) => {
          setValues({
            city: data.city || '',
            country: data.country_code || '',
          });
        })
        .catch(() => {
          setValues({
            city: '',
            country: '',
          });
        })
        .finally(() => {
          setLoadingGeo(false);
        });
    }
  }, [setValues, values.latitude, values.longitude]);

  const deleteMarker = useCallback(
    async (id: string) => {
      await deleteCheckIn(id);
      onClose();
    },
    [onClose],
  );

  return (
    <form
      className="fixed bottom-8 right-8 z-10 flex max-h-[40vh] flex-col gap-2 overflow-auto rounded-lg p-4 backdrop-blur-sm dark:bg-zinc-900/50"
      onSubmit={onSubmit(async (v) => {
        if (markerToEdit) {
          await updateCheckIn(
            markerToEdit.id,
            v.longitude,
            v.latitude,
            v.city,
            v.country,
            v.date,
            v.crossAntiMeridian,
          );
        } else {
          await checkIn(v.longitude, v.latitude, v.city, v.country, v.date, v.crossAntiMeridian);
        }

        onClose();
      })}
    >
      <Input
        label={t('Longitude')}
        step={0.0000001}
        type="number"
        {...getInputProps('longitude')}
      />
      <Input label={t('Latitude')} step={0.0000001} type="number" {...getInputProps('latitude')} />
      <Input disabled={loadingGeo} label={t('City')} {...getInputProps('city')} />
      <Input disabled={loadingGeo} label={t('Country')} {...getInputProps('country')} />
      <Input
        label={t('Date')}
        type="datetime-local"
        {...getInputProps('date')}
        onChange={(e) => setValues({ date: new Date(e.currentTarget.value) })}
        value={(() => {
          const d = new Date(values.date);
          d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
          return d.toISOString().replace('Z', '');
        })()}
      />
      <CheckBox
        label={t('Crosses Anti-meridian')}
        {...getInputProps('crossAntiMeridian', { type: 'checkbox' })}
      />
      <button className="button green" type="submit">
        {t('Save')}
      </button>
      {markerToEdit && (
        <button
          className="button red"
          onClick={() =>
            openConfirmModal({
              confirmClassName: 'red',
              confirmText: t('Delete'),
              message: t("Are you sure you want to delete this marker? This can't be undone."),
              onConfirm: () => deleteMarker(markerToEdit.id),
            })
          }
          type="button"
        >
          {t('Delete')}
        </button>
      )}
      <button className="button" onClick={onClose} type="button">
        {t('Cancel')}
      </button>
    </form>
  );
};

export const GPSCheckIn: FC<{ map?: Mapbox }> = ({ map }) => {
  const { t } = useTranslation();
  const { markerDetails, markerToEdit, setMarkerToEdit } = useMap();
  const [lngLat, setLngLat] = useState<LngLat | null>(null);

  const close = useCallback(() => {
    setMarkerToEdit(null);
    setLngLat(null);
  }, [setMarkerToEdit]);

  const mapClickHandler = useCallback(
    (event: MapMouseEvent & EventData) => {
      if (markerDetails) return;

      setMarkerToEdit(null);
      setLngLat(new LngLat(event.lngLat.lng, event.lngLat.lat));
    },
    [markerDetails, setMarkerToEdit],
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

    if (map && lngLat?.lng && lngLat?.lat) {
      const coords = new LngLat(lngLat?.lng, lngLat?.lat);

      m.setLngLat(coords)
        .addTo(map)
        .on('dragend', () => {
          const l = m.getLngLat();
          setLngLat(new LngLat(l.lng, l.lat));
        });

      map.setCenter(coords).setZoom(13);
    }

    return () => {
      m.remove();
    };
  }, [map, lngLat]);

  const [gettingGPS, setGettingGPS] = useState(false);

  return (
    <>
      <button
        className="button action ml-auto flex items-center gap-1 p-2"
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
        {gettingGPS ? <Spinner /> : <MapPin className="h-6" strokeWidth={1} />}
        <div className="hidden sm:block">{t('Check In')}</div>
      </button>
      {(markerToEdit || lngLat) && (
        <CheckInForm lngLat={lngLat} markerToEdit={markerToEdit} onClose={close} />
      )}
    </>
  );
};

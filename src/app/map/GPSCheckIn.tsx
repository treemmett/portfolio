import { useForm } from '@mantine/form';
import { EventData, LngLat, MapMouseEvent, Map as Mapbox, Marker } from 'mapbox-gl';
import { FC, useCallback, useEffect, useState } from 'react';
import { MapPin } from 'react-feather';
import { checkIn, deleteCheckIn, updateCheckIn } from './actions';
import { useMap } from './context';
import { Input } from '@components/Input';
import { openConfirmModal } from '@components/ModalManager';
import { Spinner } from '@components/Spinner';
import { geocode } from '@lib/geocode';
import { useTranslation } from '@utils/translation';

const defaultValues = {
  city: '',
  country: '',
  date: new Date(),
  latitude: 0,
  longitude: 0,
};

export const GPSCheckIn: FC<{ map?: Mapbox }> = ({ map }) => {
  const { t } = useTranslation();
  const [loadingGeo, setLoadingGeo] = useState(false);
  const { markerDetails, markerToEdit, setMarkerToEdit } = useMap();
  const { getInputProps, onSubmit, setInitialValues, setValues, values } = useForm({
    initialValues: defaultValues,
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
      setInitialValues(markerToEdit);
    }
  }, [setInitialValues, markerToEdit]);

  const close = useCallback(() => {
    setInitialValues({ ...defaultValues, date: new Date() });
    setValues({ ...defaultValues, date: new Date() });
    setMarkerToEdit(null);
  }, [setInitialValues, setMarkerToEdit, setValues]);

  const mapClickHandler = useCallback(
    (event: MapMouseEvent & EventData) => {
      if (markerDetails) return;

      setMarkerToEdit(null);
      setValues({
        latitude: event.lngLat.lat,
        longitude: event.lngLat.lng,
      });
    },
    [markerDetails, setMarkerToEdit, setValues],
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

    if (map && values.longitude && values.latitude) {
      if (!Number.isNaN(values.longitude) && !Number.isNaN(values.latitude)) {
        const coords = new LngLat(values.longitude, values.latitude);

        m.setLngLat(coords)
          .addTo(map)
          .on('dragend', () => {
            const lngLat = m.getLngLat();
            setValues({
              latitude: lngLat.lng,
              longitude: lngLat.lng,
            });
          });

        map.setCenter(coords).setZoom(13);
      }
    }

    return () => {
      m.remove();
    };
  }, [map, setValues, values.latitude, values.longitude]);

  const deleteMarker = useCallback(
    async (id: string) => {
      await deleteCheckIn(id);
      close();
    },
    [close],
  );

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
  }, [map, setValues, values.latitude, values.longitude]);

  const [gettingGPS, setGettingGPS] = useState(false);

  if (!values.latitude || !values.longitude) {
    return (
      <button
        className="button action ml-auto flex items-center gap-1 p-2"
        disabled={gettingGPS}
        onClick={() => {
          setGettingGPS(true);
          navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
              setGettingGPS(false);
              setValues({
                latitude: coords.latitude,
                longitude: coords.longitude,
              });
            },
            () => {
              setGettingGPS(false);
            },
          );
        }}
      >
        {gettingGPS ? <Spinner /> : <MapPin className="h-6" strokeWidth={1} />}
        <div className="hidden sm:block">Check In</div>
      </button>
    );
  }

  return (
    <form
      className="fixed bottom-8 right-8 z-10 flex max-h-[40vh] flex-col gap-2 overflow-auto rounded-lg p-4 backdrop-blur-sm dark:bg-zinc-900/50"
      onSubmit={onSubmit(async (v) => {
        if (markerToEdit) {
          await updateCheckIn(markerToEdit.id, v.longitude, v.latitude, v.city, v.country, v.date);
        } else {
          await checkIn(v.longitude, v.latitude, v.city, v.country, v.date);
        }

        close();
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
      <button className="button" onClick={close} type="button">
        {t('Cancel')}
      </button>
    </form>
  );
};

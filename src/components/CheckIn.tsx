import { LngLat, Map, MapMouseEvent, Marker } from 'mapbox-gl';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { FC, MutableRefObject, useCallback, useEffect, useState } from 'react';
import { Marker as MarkerEntity } from '../entities/Marker';
import { ReactComponent as Plus } from '../icons/plus-square.svg';
import { ReactComponent as X } from '../icons/x-square.svg';
import { Country } from '../lib/countryCodes';
import { apiClient } from '../utils/apiClient';
import { splitCase } from '../utils/casing';
import { getRemValue } from '../utils/pixels';
import { toString } from '../utils/queryParam';
import { Button } from './Button';
import styles from './CheckIn.module.scss';
import { useDataStore } from './DataStore';
import { Input } from './Input';

export interface CheckInProps {
  map: MutableRefObject<Map>;
}

export const CheckIn: FC<CheckInProps> = ({ map }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [selecting, setSelecting] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<LngLat>();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [country, setCountry] = useState<Country>('--' as Country);
  const [city, setCity] = useState('');
  const { dispatch, markers } = useDataStore();

  const mapClickHandler = useCallback(({ lngLat }: MapMouseEvent) => {
    setSelectedCoordinates(lngLat);
  }, []);
  useEffect(() => {
    let marker: Marker;
    if (selectedCoordinates) {
      marker = new Marker({ color: '#CF5D40' }).setLngLat(selectedCoordinates).addTo(map.current);
      map.current
        .setPadding({
          bottom: getRemValue() * 2,
          left: getRemValue() * 10,
          right: getRemValue() * 4,
          top: getRemValue() * 2,
        })
        .flyTo({ center: selectedCoordinates, zoom: 8 });
    }

    return () => {
      if (marker) {
        marker.remove();
      }
    };
  }, [map, selectedCoordinates]);

  useEffect(() => {
    const c = map.current;

    if (selecting && c) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        setSelectedCoordinates(new LngLat(coords.longitude, coords.latitude));
      });
      c.on('click', mapClickHandler);
    } else {
      setSelectedCoordinates(null);
    }

    return () => {
      if (c) {
        c.off('click', mapClickHandler);
      }
    };
  }, [map, mapClickHandler, selecting]);

  useEffect(() => {
    const id = toString(router.query.edit);
    setSelecting(!!id);

    if (id) {
      const editingMarker = markers.find((m) => m.id === id);
      if (editingMarker) {
        setSelectedCoordinates(new LngLat(editingMarker.lng, editingMarker.lat));
        setDate(new Date(editingMarker.date).toISOString().split('T')[0]);
        setCity(editingMarker.city);
        setCountry(editingMarker.country);
      }
    }
  }, [markers, router.query.edit]);

  const closeEditor = useCallback(() => {
    setSelecting(false);
    setSelectedCoordinates(null);
    setDate(new Date().toISOString().split('T')[0]);
    setCountry('--' as Country);
    setCity('');
    router.push({ query: {} }, undefined, { shallow: true });
  }, [router]);

  const saveCheckIn = useCallback(async () => {
    const id = toString(router.query.edit);
    if (id) {
      const { data } = await apiClient.patch<MarkerEntity>(`/timeline/${encodeURIComponent(id)}`, {
        city,
        country,
        date,
        lat: selectedCoordinates.lat,
        lng: selectedCoordinates.lng,
      });
      dispatch({ marker: data, type: 'UPDATE_MARKER' });
    } else {
      const { data } = await apiClient.post<MarkerEntity>('/timeline', {
        city,
        country,
        date,
        lat: selectedCoordinates.lat,
        lng: selectedCoordinates.lng,
      });
      dispatch({ marker: data, type: 'ADD_MARKER' });
    }
    closeEditor();
  }, [city, closeEditor, country, date, dispatch, router.query.edit, selectedCoordinates]);

  const deleteMarker = useCallback(async () => {
    const id = toString(router.query.edit);
    await apiClient.patch<MarkerEntity>(`/timeline/${encodeURIComponent(id)}`);
    dispatch({ id, type: 'DELETE_MARKER' });
    closeEditor();
  }, [closeEditor, dispatch, router.query.edit]);

  return (
    <>
      <Button
        className={styles['add-button']}
        inverted={selecting}
        label={t('Check in')}
        onClick={() => (selecting ? closeEditor() : setSelecting(!selecting))}
        testId="check-in"
      >
        {selecting ? <X /> : <Plus />}
      </Button>

      {selecting && (
        <div className={styles.editor}>
          <Input
            label={t('Longitude')}
            onChange={(e) =>
              setSelectedCoordinates(
                new LngLat(parseFloat(e.currentTarget.value), selectedCoordinates.lat)
              )
            }
            step={0.001}
            type="number"
            value={selectedCoordinates?.lng.toString()}
          />
          <Input
            label={t('Latitude')}
            onChange={(e) =>
              setSelectedCoordinates(
                new LngLat(selectedCoordinates.lng, parseFloat(e.currentTarget.value))
              )
            }
            step={0.001}
            type="number"
            value={selectedCoordinates?.lat.toString()}
          />
          <Input
            label={t('Date')}
            onChange={(e) => setDate(e.currentTarget.value)}
            type="date"
            value={date}
          />
          <Input
            label={t('Country')}
            onChange={(e) => setCountry(e.currentTarget.value as Country)}
            options={Object.entries(Country).map(([name, id]) => ({ id, label: splitCase(name) }))}
            type="select"
            value={country}
          />
          <Input label={t('City')} onChange={(e) => setCity(e.currentTarget.value)} value={city} />
          {router.query.edit && (
            <Button className={styles.button} onClick={deleteMarker} type="primary">
              {t('Delete')}
            </Button>
          )}
          <Button className={styles.button} onClick={saveCheckIn} type="primary">
            {t('Save')}
          </Button>
        </div>
      )}
    </>
  );
};

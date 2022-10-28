import { LngLatLike } from 'mapbox-gl';
import { Marker } from '@entities/Marker';

export const boundingCoordinates = (markers: Marker[]): { ne: LngLatLike; sw: LngLatLike } => {
  const ne: LngLatLike = markers.length
    ? { lat: markers[0].lat, lng: markers[0].lng }
    : { lat: 42.35, lng: -70.9 };
  const sw = { ...ne };
  [...markers].slice(-10).forEach((lngLat) => {
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

  return {
    ne,
    sw,
  };
};

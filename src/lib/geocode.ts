import axios from 'axios';
import { ServiceError } from '@utils/errors';

interface GeocodeResponse {
  place_id: number;
  // cspell:word licence
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  error?: string;
  address: {
    house_number: string;
    road: string;
    suburb: string;
    city?: string;
    county?: string;
    municipality: string;
    state: string;
    postcode: string;
    country: string;
    country_code: string;
  };
  // cspell:word boundingbox
  boundingbox: string[];
}

export async function geocode(
  lng: number | string,
  lat: number | string,
): Promise<GeocodeResponse['address']> {
  const { data } = await axios.get<GeocodeResponse>('https://geocode.maps.co/reverse', {
    params: { lat, lon: lng },
  });

  if (data.error) {
    throw new ServiceError('Geocoding failed');
  }

  data.address.country_code = data.address.country_code.toUpperCase();

  return data.address;
}

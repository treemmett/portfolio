import axios from 'axios';
import { Country } from './countryCodes';

interface GeocodeResponse {
  place_id: number;
  // cspell:word licence
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    house_number: string;
    road: string;
    suburb: string;
    city: string;
    municipality: string;
    state: string;
    postcode: string;
    country: string;
    country_code: Country;
  };
  // cspell:word boundingbox
  boundingbox: string[];
}

export async function geocode(lng: number, lat: number): Promise<GeocodeResponse['address']> {
  const { data } = await axios.get<GeocodeResponse>('https://geocode.maps.co/reverse', {
    params: { lat, lon: lng },
  });

  data.address.country_code = data.address.country_code.toUpperCase() as Country;

  return data.address;
}

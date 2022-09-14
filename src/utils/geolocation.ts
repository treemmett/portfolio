import axios from 'axios';
import { Config } from './config';
import { logger } from './logger';
import { Country } from '@lib/countryCodes';

interface GeolocationResponse {
  ip: string;
  hostname: string;
  continent_code: string;
  continent_name: string;
  country_code2: Country;
  country_code3: string;
  country_name: string;
  country_capital: string;
  state_prov: string;
  district: string;
  city: string;
  // cspell:word zipcode
  zipcode: string;
  latitude: string;
  longitude: string;
  is_eu: number;
  calling_code: string;
  country_tld: string;
  languages: string;
  country_flag: string;
  isp: string;
  connection_type: string;
  organization: string;
  asn: string;
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
  time_zone: {
    name: string;
    offset: number;
    current_time: string;
    current_time_unix: number;
    is_dst: boolean;
    dst_savings: number;
  };
}

export async function geolocation(ip: string): Promise<undefined | GeolocationResponse> {
  try {
    if (['127.0.0.1', '0.0.0.0', '::ffff:127.0.0.1', '::1', '0:0:0:0:0:0:0:1'].includes(ip)) {
      return undefined;
    }

    const { data } = await axios.get<GeolocationResponse>('https://api.ipgeolocation.io/ipgeo', {
      params: { apiKey: Config.GEOLOCATION_KEY, ip },
    });

    return data;
  } catch (err) {
    logger.error(err, 'Failed to load geolocation data');
    return undefined;
  }
}

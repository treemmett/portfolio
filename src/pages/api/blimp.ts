// cspell:word zipcode
import axios from 'axios';
import { nextConnect } from '../../middleware/nextConnect';
import { Config } from '../../utils/config';
import { logger } from '../../utils/logger';
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

export default nextConnect().post(async (req, res) => {
  // return immediately, client doesn't care
  res.end();

  try {
    const ip = req.socket.remoteAddress;

    const { data } = await axios.get<GeolocationResponse>('https://api.ipgeolocation.io/ipgeo', {
      params: { apiKey: Config.GEOLOCATION_KEY, ip },
    });

    await axios.post('https://getinsights.io/app/tics', {
      id: 'geolocation',
      parameters: {
        city: data.city,
        continent: data.continent_code,
        country: data.country_code2,
        district: data.district,
        ip,
        languages: data.languages,
        latitude: data.latitude,
        longitude: data.longitude,
        state: data.state_prov,
        zipcode: data.zipcode,
      },
      projectId: Config.NEXT_PUBLIC_INSIGHTS_TOKEN,
    });
  } catch (err) {
    logger.error(err, 'Failed to load geo data');
  }
});

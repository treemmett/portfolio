import axios from 'axios';
import { getClientIp } from 'request-ip';
import { Session } from '@entities/Session';
import { nextConnect } from '@middleware/nextConnect';
import { Config } from '@utils/config';
import { geolocation } from '@utils/geolocation';
import { logger } from '@utils/logger';
import { toString } from '@utils/queryParam';

export interface AnalyticsParameter {
  type: string;
  value: string;
}

export interface InsightsRequest {
  id: string;
  projectId: string;
  parameters: Record<string, string | AnalyticsParameter>;
}

export default nextConnect().post(async (req, res) => {
  // return immediately, client doesn't care
  res.send({ status: 'ok' });

  const ip = getClientIp(req);

  const [session, geoData] = await Promise.all([
    Session.fromRequest(req).catch(() => false),
    geolocation(ip),
  ]);

  const body: InsightsRequest = {
    id: req.body.id,
    parameters: {
      ...req.body.parameters,
      ip,
      username: typeof session === 'boolean' ? '<no session>' : session?.username || '<no session>',
      vercelCity: req.headers['x-vercel-ip-city']
        ? decodeURIComponent(toString(req.headers['x-vercel-ip-city']))
        : undefined,
      vercelCountry: req.headers['x-vercel-ip-country'],
      vercelLanguage: req.headers['accept-language'],
      vercelLatitude: req.headers['x-vercel-ip-latitude'],
      vercelLongitude: req.headers['x-vercel-ip-longitude'],
      vercelRegion: req.headers['x-vercel-ip-country-region'],
      vercelTimezone: req.headers['x-vercel-ip-timezone'],
    },
    projectId: Config.INSIGHTS_TOKEN,
  };

  if (geoData) {
    body.parameters.geoCity = geoData.city;
    body.parameters.geoCountry = geoData.country_code2;
    body.parameters.geoContinent = geoData.continent_code;
    body.parameters.geoState = geoData.state_prov;
    body.parameters.geoDistrict = geoData.district;
    body.parameters.geoZipcode = geoData.zipcode;
    body.parameters.geoLatitude = geoData.latitude;
    body.parameters.geoLongitude = geoData.longitude;
    body.parameters.geoLanguages = geoData.languages;
    body.parameters.geoTimezone = geoData.time_zone.offset.toString();
  }

  await axios.post('https://getinsights.io/app/tics', body).catch((err) => {
    logger.error(err, 'Analytics failed');
  });
});

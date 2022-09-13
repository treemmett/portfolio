import axios from 'axios';
import { getClientIp } from 'request-ip';
import { nextConnect } from '@middleware/nextConnect';
import { Config } from '@utils/config';

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

  const body: InsightsRequest = {
    id: req.body.id,
    parameters: {
      ...req.body.parameters,
      locationCity: req.headers['x-vercel-ip-city'],
      locationCountry: req.headers['x-vercel-ip-country'],
      locationIp: getClientIp(req),
      locationLanguage: req.headers['accept-language'],
      locationLatitude: req.headers['x-vercel-ip-latitude'],
      locationLongitude: req.headers['x-vercel-ip-longitude'],
      locationRegion: req.headers['x-vercel-ip-country-region'],
      locationTimezone: req.headers['x-vercel-ip-timezone'],
    },
    projectId: Config.INSIGHTS_TOKEN,
  };

  await axios.post('https://getinsights.io/app/tics', body);
});

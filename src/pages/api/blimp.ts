import axios from 'axios';
import { getClientIp } from 'request-ip';
import { Session } from '@entities/Session';
import { nextConnect } from '@middleware/nextConnect';
import { Config } from '@utils/config';
import { logger } from '@utils/logger';

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

  const session = await Session.fromRequest(req).catch(() => false);

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
      username: typeof session === 'boolean' ? '<no session>' : session?.username || '<no session>',
    },
    projectId: Config.INSIGHTS_TOKEN,
  };

  await axios.post('https://getinsights.io/app/tics', body).catch((err) => {
    logger.error(err, 'Analytics failed');
  });
});

import { NextApiRequest, NextApiResponse } from 'next';
import { Middleware } from 'next-connect';
import { getClientIp } from 'request-ip';
import { Session } from '@entities/Session';
import { axiom } from '@utils/axiom';
import { geolocation } from '@utils/geolocation';
import { logger } from '@utils/logger';
import { toString } from '@utils/queryParam';

export const useAnalytics: Middleware<NextApiRequest, NextApiResponse> = async (req, res, next) => {
  const { body, headers, method, url } = req;

  const isAnalytics = url === '/api/blimp';

  // immediately continue on middleware
  if (!isAnalytics) {
    next();
  }

  try {
    const ip = getClientIp(req);

    const [session, geoData] = await Promise.all([
      Session.fromRequest(req).catch(() => false),
      geolocation(ip),
    ]);

    const username =
      typeof session === 'boolean' ? '<no session>' : session?.username || '<no session>';

    const baseFields = {
      geoData,
      ip,
      username,
      'x-vercel-ip-city': headers['x-vercel-ip-city']
        ? decodeURIComponent(toString(headers['x-vercel-ip-city']))
        : undefined,
      'x-vercel-ip-country': headers['x-vercel-ip-country'],
      'x-vercel-ip-country-region': headers['x-vercel-ip-country-region'],
      'x-vercel-ip-latitude': headers['x-vercel-ip-latitude'],
      'x-vercel-ip-longitude': headers['x-vercel-ip-longitude'],
      'x-vercel-ip-timezone': headers['x-vercel-ip-timezone'],
    };

    // parse parameters on blimp requests
    if (isAnalytics) {
      const { referrer, screenType, ...parameters } = body.parameters;

      await axiom('analytics', {
        ...baseFields,
        event: body.event,
        parameters,
        referrer,
        screenType,
      });
      next();
    } else {
      await axiom('request', { ...baseFields, method, url });
    }
  } catch (err) {
    logger.error(err, 'Uncaught error in analytics middleware');
  }
};

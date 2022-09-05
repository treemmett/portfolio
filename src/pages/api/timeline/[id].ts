import { AuthorizationScopes } from '../../../entities/Jwt';
import { Marker } from '../../../entities/Marker';
import { Session } from '../../../entities/Session';
import { nextConnect } from '../../../middleware/nextConnect';
import { logger } from '../../../utils/logger';
import { toString } from '../../../utils/queryParam';
import { i18nRevalidate } from '../../../utils/revalidate';

export default nextConnect()
  .use(Session.authorizeRequest(AuthorizationScopes.post))
  .patch(async (req, res) => {
    const marker = await Marker.update(toString(req.query.id), req.body);
    logger.info('Marker updated, revalidating cache');
    await i18nRevalidate('/', res);
    res.send(marker);
  });

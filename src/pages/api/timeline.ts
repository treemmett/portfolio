import { AuthorizationScopes } from '@entities/Jwt';
import { Marker } from '@entities/Marker';
import { Session } from '@entities/Session';
import { nextConnect } from '@middleware/nextConnect';
import { i18nRevalidate } from '@utils/revalidate';

export default nextConnect()
  .use(Session.authorizeRequest(AuthorizationScopes.post))
  .post(async (req, res) => {
    const { city, country, date, lat, lng } = req.body;
    const marker = await Marker.checkIn(lng, lat, date, country, city);
    await i18nRevalidate('/timeline', res);
    res.send(marker);
  });

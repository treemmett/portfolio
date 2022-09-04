import { AuthorizationScopes } from '../../entities/Jwt';
import { Marker } from '../../entities/Marker';
import { Session } from '../../entities/Session';
import { nextConnect } from '../../middleware/nextConnect';

export default nextConnect().post(async (req, res) => {
  await Session.authorizeRequest(req, AuthorizationScopes.post);
  const marker = await Marker.checkIn(req.body);
  res.send(marker);
});

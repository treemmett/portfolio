import { Marker } from '../../entities/Marker';
import { nextConnect } from '../../middleware/nextConnect';

export default nextConnect().post(async (req, res) => {
  const marker = await Marker.checkIn(req.body);
  res.send(marker);
});

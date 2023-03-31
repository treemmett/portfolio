import { Photo } from '@entities/Photo';
import { User } from '@entities/User';
import { nextConnect } from '@middleware/nextConnect';

export default nextConnect().get(async (req, res) => {
  const user = await User.findById('53e0af33-67b7-4f3f-ade1-0340a84d5e6b');
  const data = await Photo.getStats(user);
  res.send(data);
});

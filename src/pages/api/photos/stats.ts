import { Photo } from '@entities/Photo';
import { User } from '@entities/User';
import { nextConnect } from '@middleware/nextConnect';

export default nextConnect()
  .use(User.authorize())
  .get(async (req, res) => {
    const data = await Photo.getStats(req.user);
    res.send(data);
  });

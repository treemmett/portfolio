import { User } from '@entities/User';
import { connectToDatabaseMiddleware } from '@middleware/database';
import { nextConnect } from '@middleware/nextConnect';

export default nextConnect().get(
  User.authorize(),
  connectToDatabaseMiddleware,
  async (req, res) => {
    res.send(req.user);
  }
);

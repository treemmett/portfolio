import { User } from '@entities/User';
import { connectToDatabaseMiddleware } from '@middleware/database';
import { nextConnect } from '@middleware/nextConnect';

export default nextConnect()
  .use(User.authorize(), connectToDatabaseMiddleware)
  .get(async (req, res) => {
    res.send(req.user);
  })
  .patch(async (req, res) => {
    if (req.body.username) {
      req.user.username = req.body.username;
    }

    await req.user.save();

    res.send(req.user);
  });

import { Joi, celebrate } from 'celebrate';
import { User } from '@entities/User';
import { nextConnect } from '@middleware/nextConnect';

export default nextConnect().get(
  celebrate({ query: { username: Joi.string().required() } }),
  async (req, res) => {
    const available = await User.usernameAvailable(req.query.username as string);
    res.send(available);
  }
);

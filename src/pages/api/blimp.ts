import { nextConnect } from '@middleware/nextConnect';

export default nextConnect().post(async (req, res) => {
  res.send({ status: 'ok' });
});

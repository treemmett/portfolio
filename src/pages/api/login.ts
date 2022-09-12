import { serialize } from 'cookie';
import { authorizeGitHub } from '../../utils/auth';
import { nextConnect } from '@middleware/nextConnect';

export default nextConnect().post(async (req, res) => {
  const { accessToken, expiration, signature } = await authorizeGitHub(req.body.code);
  res.setHeader(
    'Set-Cookie',
    serialize('xsrf-token', signature, {
      expires: expiration,
      httpOnly: true,
      path: '/',
    })
  );
  res.send(accessToken);
});

import nock from 'nock';

if (process.env.MOCK === 'true') {
  nock('https://github.com')
    .post('/login/oauth/access_token')
    .reply(200, (uri, body: Record<string, string>) => ({ access_token: body.code }))
    .persist();

  nock('https://api.github.com')
    .get('/user')
    .reply(200, function reply() {
      const { authorization } = this.req.headers;

      const [, token] = authorization?.split(' ') || [];

      return {
        login: token || 'bob',
      };
    })
    .persist();
}

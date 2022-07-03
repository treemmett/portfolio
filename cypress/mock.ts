if (process.env.MOCK === 'true') {
  const nock = require('nock');

  nock('https://github.com')
    .post('/login/oauth/access_token')
    .reply(200, { access_token: 'foobar' })
    .persist();

  nock('https://api.github.com').get('/user').reply(200, { login: 'treemmett' });
}

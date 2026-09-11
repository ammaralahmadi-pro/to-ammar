const { OAuth2Client } = require('google-auth-library');
const env = require('./env');

function newClient() {
  return new OAuth2Client(env.google.clientId, env.google.clientSecret, env.google.redirectUri);
}

function buildAuthUrl(state) {
  const client = newClient();
  return client.generateAuthUrl({
    access_type: 'online',
    scope: ['openid', 'email', 'profile'],
    state,
  });
}

async function exchangeCodeForProfile(code) {
  const client = newClient();
  const { tokens } = await client.getToken(code);
  const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: env.google.clientId });
  const payload = ticket.getPayload();
  return {
    googleId: payload.sub,
    email: (payload.email || '').toLowerCase(),
    name: payload.name || payload.email,
    pictureUrl: payload.picture || null,
  };
}

module.exports = { buildAuthUrl, exchangeCodeForProfile };

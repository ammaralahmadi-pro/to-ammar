const { google } = require('googleapis');
const env = require('./env');
const { encrypt, decrypt } = require('./crypto');
const prisma = require('./prisma');

const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
];

function newOAuthClient() {
  return new google.auth.OAuth2(env.google.clientId, env.google.clientSecret, env.google.redirectUri);
}

function buildAuthUrl(state) {
  const client = newOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // نضمن الحصول على refresh_token حتى لو سبق للمستخدم أن وافق
    scope: SCOPES,
    state,
  });
}

async function exchangeCodeForTokens(code) {
  const client = newOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  const oauth2 = google.oauth2({ auth: client, version: 'v2' });
  const { data: profile } = await oauth2.userinfo.get();
  return { tokens, profile };
}

// يبني عميل Calendar API لمستخدم معيّن، ويجدّد access_token تلقائيًا عند الحاجة
async function calendarClientForUser(user) {
  const client = newOAuthClient();
  client.setCredentials({
    access_token: decrypt(user.accessTokenEnc),
    refresh_token: decrypt(user.refreshTokenEnc),
    expiry_date: user.tokenExpiry.getTime(),
  });

  client.on('tokens', async (tokens) => {
    const data = { accessTokenEnc: encrypt(tokens.access_token) };
    if (tokens.expiry_date) data.tokenExpiry = new Date(tokens.expiry_date);
    if (tokens.refresh_token) data.refreshTokenEnc = encrypt(tokens.refresh_token);
    await prisma.user.update({ where: { id: user.id }, data }).catch(() => {});
  });

  if (Date.now() >= user.tokenExpiry.getTime() - 60_000) {
    await client.getAccessToken(); // يطلق حدث 'tokens' أعلاه ويحفظ القيمة الجديدة
  }

  return google.calendar({ version: 'v3', auth: client });
}

module.exports = { buildAuthUrl, exchangeCodeForTokens, calendarClientForUser };

require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`متغيّر البيئة مفقود: ${name} — راجع server/.env.example`);
  return value;
}

module.exports = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  databaseUrl: required('DATABASE_URL'),
  google: {
    clientId: required('GOOGLE_CLIENT_ID'),
    clientSecret: required('GOOGLE_CLIENT_SECRET'),
    redirectUri: required('GOOGLE_REDIRECT_URI'),
  },
  allowedEmails: required('ALLOWED_EMAILS')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  jwtSecret: required('JWT_SECRET'),
  tokenEncryptionKey: required('TOKEN_ENCRYPTION_KEY'),
};

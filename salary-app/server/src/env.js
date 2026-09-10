require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`متغيّر البيئة مفقود: ${name} — راجع server/.env.example`);
  return value;
}

module.exports = {
  port: process.env.PORT || 4100,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3100',
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
};

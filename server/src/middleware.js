const jwt = require('jsonwebtoken');
const env = require('./env');
const prisma = require('./prisma');

async function requireAuth(req, res, next) {
  const token = req.cookies.session;
  if (!token) return res.status(401).json({ error: 'not_authenticated' });

  try {
    const { userId } = jwt.verify(token, env.jwtSecret);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ error: 'not_authenticated' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'not_authenticated' });
  }
}

module.exports = { requireAuth };

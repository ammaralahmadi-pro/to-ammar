const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./env');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'يجب تسجيل الدخول' });

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'الجلسة غير صالحة، سجّل الدخول مجددًا' });
  }
}

module.exports = { requireAuth };

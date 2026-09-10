const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./env');

function requireAuth(req, res, next) {
  const token = req.cookies?.token;
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

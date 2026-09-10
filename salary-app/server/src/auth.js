const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('./prisma');
const { jwtSecret, nodeEnv } = require('./env');
const { requireAuth } = require('./middleware');
const defaultCategories = require('./defaultCategories');

const router = express.Router();

const cookieOptions = {
  httpOnly: true,
  secure: nodeEnv === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, currency: user.currency };
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'الاسم والبريد وكلمة المرور مطلوبة' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return res.status(409).json({ error: 'البريد الإلكتروني مستخدم مسبقًا' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      categories: {
        create: defaultCategories.map((c, i) => ({ ...c, sortOrder: i })),
      },
    },
  });

  const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '30d' });
  res.cookie('token', token, cookieOptions);
  res.status(201).json({ user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'البريد وكلمة المرور مطلوبان' });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });

  const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '30d' });
  res.cookie('token', token, cookieOptions);
  res.json({ user: publicUser(user) });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', cookieOptions);
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(401).json({ error: 'المستخدم غير موجود' });
  res.json({ user: publicUser(user) });
});

module.exports = router;

const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('./env');
const prisma = require('./prisma');
const { requireAuth } = require('./middleware');
const { buildAuthUrl, exchangeCodeForProfile } = require('./googleClient');
const defaultCategories = require('./defaultCategories');

const router = express.Router();

// تخزين مؤقت لقيم state (حماية CSRF لتدفّق OAuth) — ذاكرة العملية كافية لتطبيق فردي
const pendingStates = new Set();

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    pictureUrl: user.pictureUrl,
    currency: user.currency,
    autoSaveEnabled: user.autoSaveEnabled,
    autoSavePercent: user.autoSavePercent,
  };
}

router.get('/google/login', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  pendingStates.add(state);
  setTimeout(() => pendingStates.delete(state), 5 * 60_000);
  res.redirect(buildAuthUrl(state));
});

router.get('/google/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error || !code || !state || !pendingStates.has(state)) {
    return res.redirect(`${env.frontendUrl}/login?error=auth_failed`);
  }
  pendingStates.delete(state);

  try {
    const profile = await exchangeCodeForProfile(code);

    if (!env.allowedEmails.includes(profile.email)) {
      return res.redirect(`${env.frontendUrl}/login?error=not_allowed`);
    }

    const existing = await prisma.user.findUnique({ where: { email: profile.email } });
    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: { name: profile.name, pictureUrl: profile.pictureUrl, googleId: profile.googleId },
        })
      : await prisma.user.create({
          data: {
            email: profile.email,
            name: profile.name,
            pictureUrl: profile.pictureUrl,
            googleId: profile.googleId,
            categories: { create: defaultCategories.map((c, i) => ({ ...c, sortOrder: i })) },
          },
        });

    const sessionToken = jwt.sign({ userId: user.id }, env.jwtSecret, { expiresIn: '30d' });
    // نمرّر الجلسة كتوكن في الرابط بدل كوكي — يتفادى قيود كوكيز الطرف الثالث
    // بين نطاق الواجهة (Vercel) ونطاق الخادم (Railway)
    res.redirect(`${env.frontendUrl}/auth/callback?token=${sessionToken}`);
  } catch (err) {
    console.error('Google OAuth callback failed:', err);
    res.redirect(`${env.frontendUrl}/login?error=server_error`);
  }
});

router.post('/logout', (req, res) => {
  res.status(204).end();
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(401).json({ error: 'المستخدم غير موجود' });
  res.json({ user: publicUser(user) });
});

router.patch('/settings', requireAuth, async (req, res) => {
  const { autoSaveEnabled, autoSavePercent } = req.body || {};
  const data = {};
  if (autoSaveEnabled !== undefined) data.autoSaveEnabled = Boolean(autoSaveEnabled);
  if (autoSavePercent !== undefined) {
    if (typeof autoSavePercent !== 'number' || autoSavePercent < 0 || autoSavePercent > 100) {
      return res.status(400).json({ error: 'نسبة غير صحيحة' });
    }
    data.autoSavePercent = autoSavePercent;
  }
  const user = await prisma.user.update({ where: { id: req.userId }, data });
  res.json({ user: publicUser(user) });
});

module.exports = router;

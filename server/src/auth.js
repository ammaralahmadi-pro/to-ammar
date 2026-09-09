const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('./env');
const prisma = require('./prisma');
const { encrypt } = require('./crypto');
const { buildAuthUrl, exchangeCodeForTokens } = require('./googleClient');

const router = express.Router();

// تخزين مؤقت لقيم state (حماية CSRF لتدفّق OAuth) — ذاكرة العملية كافية لتطبيق عائلي
const pendingStates = new Set();

router.get('/google/login', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  pendingStates.add(state);
  setTimeout(() => pendingStates.delete(state), 5 * 60_000);
  res.redirect(buildAuthUrl(state));
});

router.get('/google/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error || !code || !state || !pendingStates.has(state)) {
    return res.redirect(`${env.frontendUrl}/?error=auth_failed`);
  }
  pendingStates.delete(state);

  try {
    const { tokens, profile } = await exchangeCodeForTokens(code);
    const email = (profile.email || '').toLowerCase();

    if (!env.allowedEmails.includes(email)) {
      return res.redirect(`${env.frontendUrl}/?error=not_allowed`);
    }
    if (!tokens.refresh_token) {
      // يحدث لو سبق للمستخدم منح الإذن بدون prompt=consent — نطلب موافقة جديدة
      const existing = await prisma.user.findUnique({ where: { email } });
      if (!existing) return res.redirect(`${env.frontendUrl}/?error=missing_refresh_token`);
    }

    const existingUsers = await prisma.user.count();
    const colorTag = (await prisma.user.findUnique({ where: { email } }))?.colorTag
      || (existingUsers === 0 ? 'primary' : 'secondary');

    const data = {
      name: profile.name || email,
      pictureUrl: profile.picture || null,
      googleId: profile.id,
      colorTag,
      accessTokenEnc: encrypt(tokens.access_token),
      tokenExpiry: new Date(tokens.expiry_date),
      ...(tokens.refresh_token ? { refreshTokenEnc: encrypt(tokens.refresh_token) } : {}),
    };

    const user = await prisma.user.upsert({
      where: { email },
      create: { email, ...data, refreshTokenEnc: data.refreshTokenEnc || encrypt('') },
      update: data,
    });

    const sessionToken = jwt.sign({ userId: user.id }, env.jwtSecret, { expiresIn: '30d' });
    // نمرّر الجلسة كتوكن في الرابط بدل كوكي — متصفحات الجوال (خصوصًا Safari)
    // تحجب كوكيز الطرف الثالث بين نطاق الواجهة (Vercel) ونطاق الخادم (Railway)
    res.redirect(`${env.frontendUrl}/auth/callback?token=${sessionToken}`);
  } catch (err) {
    console.error('Google OAuth callback failed:', err);
    res.redirect(`${env.frontendUrl}/?error=server_error`);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.status(204).end();
});

module.exports = router;

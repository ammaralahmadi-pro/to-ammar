const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const env = require('./env');
const authRoutes = require('./auth');
const eventRoutes = require('./events');
const { requireAuth } = require('./middleware');

const app = express();

app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);

app.get('/api/me', requireAuth, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    pictureUrl: req.user.pictureUrl,
    colorTag: req.user.colorTag,
  });
});

app.use('/api/events', eventRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'server_error' });
});

app.listen(env.port, () => {
  console.log(`Family Calendar API يعمل على المنفذ ${env.port}`);
});

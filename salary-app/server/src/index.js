const express = require('express');
const cors = require('cors');
const { port, frontendUrl } = require('./env');

const authRouter = require('./auth');
const categoriesRouter = require('./categories');
const salaryRouter = require('./salary');
const expensesRouter = require('./expenses');
const dashboardRouter = require('./dashboard');

const app = express();

app.use(cors({ origin: frontendUrl }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/auth', authRouter);
app.use('/categories', categoriesRouter);
app.use('/salary', salaryRouter);
app.use('/expenses', expensesRouter);
app.use('/dashboard', dashboardRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'حدث خطأ غير متوقع' });
});

app.listen(port, () => {
  console.log(`salary-app server listening on http://localhost:${port}`);
});

const express = require('express');
const prisma = require('./prisma');
const { requireAuth } = require('./middleware');

const router = express.Router();
router.use(requireAuth);

function parsePeriod(req, res) {
  const year = Number(req.params.year);
  const month = Number(req.params.month);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    res.status(400).json({ error: 'شهر أو سنة غير صحيحة' });
    return null;
  }
  return { year, month };
}

router.get('/:year/:month', async (req, res) => {
  const period = parsePeriod(req, res);
  if (!period) return;

  const salary = await prisma.monthlySalary.findUnique({
    where: { userId_year_month: { userId: req.userId, ...period } },
  });
  res.json({ salary });
});

router.put('/:year/:month', async (req, res) => {
  const period = parsePeriod(req, res);
  if (!period) return;

  const { amount, extraIncome } = req.body || {};
  if (typeof amount !== 'number' || amount < 0) {
    return res.status(400).json({ error: 'قيمة الراتب غير صحيحة' });
  }
  const extra = typeof extraIncome === 'number' && extraIncome >= 0 ? extraIncome : 0;

  const salary = await prisma.monthlySalary.upsert({
    where: { userId_year_month: { userId: req.userId, ...period } },
    update: { amount, extraIncome: extra },
    create: { userId: req.userId, ...period, amount, extraIncome: extra },
  });
  res.json({ salary });
});

module.exports = router;

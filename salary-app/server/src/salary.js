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

router.get('/summary/extra-income', async (req, res) => {
  const result = await prisma.monthlySalary.aggregate({
    where: { userId: req.userId, extraIncome: { gt: 0 } },
    _sum: { extraIncome: true },
    _count: { extraIncome: true },
  });
  res.json({
    total: result._sum.extraIncome || 0,
    monthsCount: result._count.extraIncome || 0,
  });
});

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

  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (user?.autoSaveEnabled) {
    const savingsCategory = await prisma.category.findFirst({
      where: { userId: req.userId, group: 'savings' },
      orderBy: { sortOrder: 'asc' },
    });
    if (savingsCategory) {
      const autoSaveAmount = ((amount + extra) * user.autoSavePercent) / 100;
      const marker = 'ادخار تلقائي (ادفع لنفسك أولاً)';
      const existingExpense = await prisma.expense.findFirst({
        where: { userId: req.userId, categoryId: savingsCategory.id, ...period, description: marker },
      });
      if (existingExpense) {
        await prisma.expense.update({ where: { id: existingExpense.id }, data: { amount: autoSaveAmount } });
      } else {
        await prisma.expense.create({
          data: { userId: req.userId, categoryId: savingsCategory.id, ...period, amount: autoSaveAmount, description: marker },
        });
      }
    }
  }

  res.json({ salary });
});

module.exports = router;

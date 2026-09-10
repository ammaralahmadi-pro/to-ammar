const express = require('express');
const prisma = require('./prisma');
const { requireAuth } = require('./middleware');

const router = express.Router();
router.use(requireAuth);

// نسبة الاستهلاك التي تُطلق تنبيه الاقتراب من الحد (المتطلب 4.8)
const WARNING_THRESHOLD = 0.8;

router.get('/:year/:month', async (req, res) => {
  const year = Number(req.params.year);
  const month = Number(req.params.month);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return res.status(400).json({ error: 'شهر أو سنة غير صحيحة' });
  }

  const [salary, categories, expenses] = await Promise.all([
    prisma.monthlySalary.findUnique({ where: { userId_year_month: { userId: req.userId, year, month } } }),
    prisma.category.findMany({ where: { userId: req.userId }, orderBy: { sortOrder: 'asc' } }),
    prisma.expense.findMany({ where: { userId: req.userId, year, month } }),
  ]);

  const totalIncome = (salary?.amount || 0) + (salary?.extraIncome || 0);

  const spentByCategory = new Map();
  for (const expense of expenses) {
    spentByCategory.set(expense.categoryId, (spentByCategory.get(expense.categoryId) || 0) + expense.amount);
  }

  let totalPlanned = 0;
  let totalSpent = 0;

  const categoryStats = categories.map((category) => {
    const planned = category.type === 'percentage' ? (totalIncome * category.value) / 100 : category.value;
    const spent = spentByCategory.get(category.id) || 0;
    const remaining = planned - spent;
    const percentUsed = planned > 0 ? spent / planned : spent > 0 ? Infinity : 0;

    let status = 'ok';
    if (percentUsed > 1) status = 'over';
    else if (percentUsed >= WARNING_THRESHOLD) status = 'warning';

    totalPlanned += planned;
    totalSpent += spent;

    return {
      id: category.id,
      name: category.name,
      type: category.type,
      value: category.value,
      planned,
      spent,
      remaining,
      percentUsed: Number.isFinite(percentUsed) ? percentUsed : 1,
      status,
    };
  });

  res.json({
    year,
    month,
    salary: salary?.amount || 0,
    extraIncome: salary?.extraIncome || 0,
    totalIncome,
    hasSalary: Boolean(salary),
    categories: categoryStats,
    totalPlanned,
    totalSpent,
    totalRemaining: totalIncome - totalSpent,
    unallocated: totalIncome - totalPlanned,
  });
});

module.exports = router;

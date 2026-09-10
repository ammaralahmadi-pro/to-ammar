const express = require('express');
const prisma = require('./prisma');
const { requireAuth } = require('./middleware');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return res.status(400).json({ error: 'شهر أو سنة غير صحيحة' });
  }
  const where = { userId: req.userId, year, month };
  if (req.query.categoryId) where.categoryId = req.query.categoryId;

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { category: { select: { name: true } } },
  });
  res.json({ expenses });
});

router.post('/', async (req, res) => {
  const { categoryId, amount, description, date } = req.body || {};
  if (!categoryId || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'بيانات المصروف غير صحيحة' });
  }
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId: req.userId } });
  if (!category) return res.status(404).json({ error: 'الفئة غير موجودة' });

  const expenseDate = date ? new Date(date) : new Date();
  if (Number.isNaN(expenseDate.getTime())) return res.status(400).json({ error: 'تاريخ غير صحيح' });

  const expense = await prisma.expense.create({
    data: {
      userId: req.userId,
      categoryId,
      amount,
      description: description || null,
      date: expenseDate,
      year: expenseDate.getFullYear(),
      month: expenseDate.getMonth() + 1,
    },
  });
  res.status(201).json({ expense });
});

router.patch('/:id', async (req, res) => {
  const expense = await prisma.expense.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!expense) return res.status(404).json({ error: 'المصروف غير موجود' });

  const { amount, description, date } = req.body || {};
  const data = {};
  if (amount !== undefined) {
    if (typeof amount !== 'number' || amount <= 0) return res.status(400).json({ error: 'مبلغ غير صحيح' });
    data.amount = amount;
  }
  if (description !== undefined) data.description = description || null;
  if (date !== undefined) {
    const expenseDate = new Date(date);
    if (Number.isNaN(expenseDate.getTime())) return res.status(400).json({ error: 'تاريخ غير صحيح' });
    data.date = expenseDate;
    data.year = expenseDate.getFullYear();
    data.month = expenseDate.getMonth() + 1;
  }

  const updated = await prisma.expense.update({ where: { id: expense.id }, data });
  res.json({ expense: updated });
});

router.delete('/:id', async (req, res) => {
  const expense = await prisma.expense.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!expense) return res.status(404).json({ error: 'المصروف غير موجود' });

  await prisma.expense.delete({ where: { id: expense.id } });
  res.json({ ok: true });
});

module.exports = router;

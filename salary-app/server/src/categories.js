const express = require('express');
const prisma = require('./prisma');
const { requireAuth } = require('./middleware');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { userId: req.userId },
    orderBy: { sortOrder: 'asc' },
  });
  res.json({ categories });
});

router.post('/', async (req, res) => {
  const { name, type, value } = req.body || {};
  if (!name || !['percentage', 'fixed'].includes(type) || typeof value !== 'number' || value < 0) {
    return res.status(400).json({ error: 'بيانات الفئة غير صحيحة' });
  }
  const count = await prisma.category.count({ where: { userId: req.userId } });
  const category = await prisma.category.create({
    data: { userId: req.userId, name, type, value, sortOrder: count },
  });
  res.status(201).json({ category });
});

router.patch('/:id', async (req, res) => {
  const category = await prisma.category.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!category) return res.status(404).json({ error: 'الفئة غير موجودة' });

  const { name, type, value } = req.body || {};
  const data = {};
  if (name !== undefined) data.name = name;
  if (type !== undefined) {
    if (!['percentage', 'fixed'].includes(type)) return res.status(400).json({ error: 'نوع غير صحيح' });
    data.type = type;
  }
  if (value !== undefined) {
    if (typeof value !== 'number' || value < 0) return res.status(400).json({ error: 'قيمة غير صحيحة' });
    data.value = value;
  }

  const updated = await prisma.category.update({ where: { id: category.id }, data });
  res.json({ category: updated });
});

router.delete('/:id', async (req, res) => {
  const category = await prisma.category.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!category) return res.status(404).json({ error: 'الفئة غير موجودة' });

  await prisma.category.delete({ where: { id: category.id } });
  res.json({ ok: true });
});

module.exports = router;

const express = require('express');
const prisma = require('./prisma');
const { requireAuth } = require('./middleware');

const router = express.Router();
router.use(requireAuth);

const GROUPS = ['debts', 'bills', 'variable', 'savings'];

router.get('/', async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { userId: req.userId },
    orderBy: { sortOrder: 'asc' },
  });
  res.json({ categories });
});

router.post('/', async (req, res) => {
  const { name, type, value, group } = req.body || {};
  if (!name || !['percentage', 'fixed'].includes(type) || typeof value !== 'number' || value < 0) {
    return res.status(400).json({ error: 'بيانات الفئة غير صحيحة' });
  }
  if (group !== undefined && !GROUPS.includes(group)) {
    return res.status(400).json({ error: 'مجموعة غير صحيحة' });
  }
  const count = await prisma.category.count({ where: { userId: req.userId } });
  const category = await prisma.category.create({
    data: { userId: req.userId, name, type, value, group: group || 'variable', sortOrder: count },
  });
  res.status(201).json({ category });
});

router.patch('/:id', async (req, res) => {
  const category = await prisma.category.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!category) return res.status(404).json({ error: 'الفئة غير موجودة' });

  const { name, type, value, group } = req.body || {};
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
  if (group !== undefined) {
    if (!GROUPS.includes(group)) return res.status(400).json({ error: 'مجموعة غير صحيحة' });
    data.group = group;
  }

  const updated = await prisma.category.update({ where: { id: category.id }, data });
  res.json({ category: updated });
});

const TEMPLATE_ITEMS = [
  { key: 'needs', name: 'الاحتياجات الأساسية', group: 'bills' },
  { key: 'wants', name: 'الرغبات والرفاهية', group: 'variable' },
  { key: 'savings', name: 'الادخار والاستثمار', group: 'savings' },
];

router.post('/apply-template', async (req, res) => {
  const { needs, wants, savings } = req.body || {};
  const values = { needs, wants, savings };
  const total = (needs || 0) + (wants || 0) + (savings || 0);
  if ([needs, wants, savings].some((v) => typeof v !== 'number' || v < 0) || Math.round(total) !== 100) {
    return res.status(400).json({ error: 'النسب يجب أن تكون أرقامًا موجبة ومجموعها 100%' });
  }

  const count = await prisma.category.count({ where: { userId: req.userId } });
  const created = [];
  for (let i = 0; i < TEMPLATE_ITEMS.length; i += 1) {
    const item = TEMPLATE_ITEMS[i];
    const existing = await prisma.category.findFirst({ where: { userId: req.userId, name: item.name } });
    const category = existing
      ? await prisma.category.update({
          where: { id: existing.id },
          data: { type: 'percentage', value: values[item.key], group: item.group },
        })
      : await prisma.category.create({
          data: {
            userId: req.userId,
            name: item.name,
            type: 'percentage',
            value: values[item.key],
            group: item.group,
            sortOrder: count + i,
          },
        });
    created.push(category);
  }
  res.status(201).json({ categories: created });
});

router.delete('/:id', async (req, res) => {
  const category = await prisma.category.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!category) return res.status(404).json({ error: 'الفئة غير موجودة' });

  await prisma.category.delete({ where: { id: category.id } });
  res.json({ ok: true });
});

module.exports = router;

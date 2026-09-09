const express = require('express');
const prisma = require('./prisma');
const { requireAuth } = require('./middleware');
const { calendarClientForUser } = require('./googleClient');

const router = express.Router();
router.use(requireAuth);

function toGoogleEvent({ title, location, notes, startAt, endAt, allDay, familyEventId }) {
  const timeField = allDay
    ? { date: startAt.slice(0, 10) }
    : { dateTime: new Date(startAt).toISOString() };
  const endField = allDay
    ? { date: endAt.slice(0, 10) }
    : { dateTime: new Date(endAt).toISOString() };
  return {
    summary: title,
    location: location || undefined,
    description: notes || undefined,
    start: timeField,
    end: endField,
    extendedProperties: { private: { familyEventId } },
  };
}

async function familyUsers() {
  return prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
}

// GET /api/events?start=ISO&end=ISO — يجلب مباشرة من Google Calendar لكل أفراد العائلة
// ويدمج نسخ الحدث المشترك (بنفس familyEventId) في عنصر واحد
router.get('/', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ error: 'start و end مطلوبان' });

  try {
    const users = await familyUsers();
    const merged = new Map(); // familyEventId أو googleEventId -> عنصر موحّد

    for (const user of users) {
      const calendar = await calendarClientForUser(user);
      const { data } = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date(start).toISOString(),
        timeMax: new Date(end).toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 250,
      });

      for (const gEvent of data.items || []) {
        const familyEventId = gEvent.extendedProperties?.private?.familyEventId;
        const key = familyEventId || `${user.id}:${gEvent.id}`;
        if (merged.has(key)) continue; // نسخة أخرى من نفس الحدث المشترك — تُعرض مرة واحدة

        merged.set(key, {
          id: familyEventId || gEvent.id,
          isFamilyEvent: Boolean(familyEventId),
          ownerColorTag: user.colorTag,
          ownerName: user.name,
          title: gEvent.summary || '(بدون عنوان)',
          location: gEvent.location || null,
          notes: gEvent.description || null,
          startAt: gEvent.start.dateTime || gEvent.start.date,
          endAt: gEvent.end.dateTime || gEvent.end.date,
          allDay: Boolean(gEvent.start.date),
        });
      }
    }

    const items = [...merged.values()].sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
    res.json({ items });
  } catch (err) {
    console.error('GET /api/events failed:', err);
    res.status(502).json({ error: 'تعذّر جلب المواعيد من Google Calendar' });
  }
});

// POST /api/events — ينشئ الحدث في قاعدة البيانات، ثم يكتبه في تقويم كل فرد مستهدف
router.post('/', async (req, res) => {
  const { title, location, notes, startAt, endAt, allDay, visibility } = req.body;
  if (!title || !startAt || !endAt) return res.status(400).json({ error: 'العنوان والتاريخ/الوقت مطلوبة' });

  const isShared = visibility !== 'mine';
  const users = await familyUsers();
  const targets = isShared ? users : [req.user];

  const event = await prisma.event.create({
    data: {
      title,
      location: location || null,
      notes: notes || null,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      allDay: Boolean(allDay),
      visibility: isShared ? 'shared' : 'mine',
      ownerId: req.user.id,
    },
  });

  try {
    for (const user of targets) {
      const calendar = await calendarClientForUser(user);
      const { data } = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: toGoogleEvent({ title, location, notes, startAt, endAt, allDay, familyEventId: event.id }),
      });
      await prisma.eventCopy.create({
        data: { eventId: event.id, userId: user.id, googleEventId: data.id },
      });
    }
    res.status(201).json({ id: event.id });
  } catch (err) {
    console.error('POST /api/events failed:', err);
    await prisma.event.delete({ where: { id: event.id } }).catch(() => {});
    res.status(502).json({ error: 'تعذّر إنشاء الموعد في Google Calendar' });
  }
});

// PATCH /api/events/:id — يحدّث كل نسخ الحدث في تقاويم Google المرتبطة به
router.patch('/:id', async (req, res) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: { copies: { include: { user: true } } },
  });
  if (!event) return res.status(404).json({ error: 'الموعد غير موجود' });

  const patch = { ...event, ...req.body };
  if (req.body.startAt) patch.startAt = req.body.startAt;
  if (req.body.endAt) patch.endAt = req.body.endAt;

  try {
    for (const copy of event.copies) {
      const calendar = await calendarClientForUser(copy.user);
      await calendar.events.patch({
        calendarId: copy.googleCalendarId,
        eventId: copy.googleEventId,
        requestBody: toGoogleEvent({ ...patch, familyEventId: event.id }),
      });
    }
    await prisma.event.update({
      where: { id: event.id },
      data: {
        title: patch.title,
        location: patch.location || null,
        notes: patch.notes || null,
        startAt: new Date(patch.startAt),
        endAt: new Date(patch.endAt),
        allDay: Boolean(patch.allDay),
      },
    });
    res.status(204).end();
  } catch (err) {
    console.error('PATCH /api/events failed:', err);
    res.status(502).json({ error: 'تعذّر تحديث الموعد في Google Calendar' });
  }
});

// DELETE /api/events/:id — يحذف كل نسخ الحدث من تقاويم Google، ثم السجل نفسه
router.delete('/:id', async (req, res) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: { copies: { include: { user: true } } },
  });
  if (!event) return res.status(404).json({ error: 'الموعد غير موجود' });

  try {
    for (const copy of event.copies) {
      const calendar = await calendarClientForUser(copy.user);
      await calendar.events.delete({ calendarId: copy.googleCalendarId, eventId: copy.googleEventId }).catch((err) => {
        if (err.code !== 404 && err.code !== 410) throw err; // حذف مسبق من Google نفسه — نتجاهله
      });
    }
    await prisma.event.delete({ where: { id: event.id } });
    res.status(204).end();
  } catch (err) {
    console.error('DELETE /api/events failed:', err);
    res.status(502).json({ error: 'تعذّر حذف الموعد من Google Calendar' });
  }
});

module.exports = router;

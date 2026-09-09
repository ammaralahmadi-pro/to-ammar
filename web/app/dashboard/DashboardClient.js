'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import EventCard from '../../components/EventCard';
import EventForm from '../../components/EventForm';

const DAY_LABELS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

function rangeStartEnd() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 21);
  return { start: start.toISOString(), end: end.toISOString() };
}

function groupByDay(events) {
  const groups = new Map();
  for (const event of events) {
    const key = new Date(event.startAt).toDateString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(event);
  }
  return [...groups.entries()];
}

function formatDayHeading(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date - today) / 86400000);
  const dayName = DAY_LABELS[date.getDay()];
  const numeric = date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' });
  if (diffDays === 0) return `اليوم · ${dayName} ${numeric}`;
  if (diffDays === 1) return `غدًا · ${dayName} ${numeric}`;
  return `${dayName} ${numeric}`;
}

export default function DashboardClient() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState(null); // null | 'new' | event object
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const me = await api.me();
      setUser(me);
      const { start, end } = rangeStartEnd();
      const { items } = await api.listEvents(start, end);
      setEvents(items);
    } catch (err) {
      if (err.status === 401) return router.replace('/');
      setError('تعذّر الاتصال بالخادم أو بتقويم Google. حاول تحديث الصفحة.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const dayGroups = useMemo(() => groupByDay(events), [events]);

  async function handleSubmit(payload) {
    setSaving(true);
    try {
      if (formState && formState !== 'new') {
        await api.updateEvent(formState.id, payload);
      } else {
        await api.createEvent(payload);
      }
      setFormState(null);
      await load();
    } catch {
      setError('تعذّر حفظ الموعد في Google Calendar. حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(event) {
    if (!confirm(`حذف "${event.title}" من تقويم Google؟`)) return;
    try {
      await api.deleteEvent(event.id);
      await load();
    } catch {
      setError('تعذّر حذف الموعد.');
    }
  }

  async function handleLogout() {
    await api.logout();
    router.replace('/');
  }

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-black/5">
        <div className="max-w-lg mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-apricot flex items-center justify-center text-sm font-extrabold">
              📅
            </div>
            <div>
              <h1 className="font-extrabold text-[15px] leading-none">مواعيدنا</h1>
              {user && <p className="text-[11px] text-black/40 mt-0.5">{user.name}</p>}
            </div>
          </div>
          <button onClick={handleLogout} className="text-xs font-bold text-black/40 px-2 py-1">
            تسجيل الخروج
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5">
        {error && (
          <div className="mb-4 rounded-xl bg-glaze px-4 py-3 text-sm text-black/80 flex items-center justify-between">
            {error}
            <button onClick={load} className="font-bold text-xs">إعادة المحاولة</button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-glaze animate-pulse" />
            ))}
          </div>
        )}

        {!loading && dayGroups.length === 0 && !error && (
          <div className="text-center py-20 text-black/40">
            <p className="text-3xl mb-3">🗓️</p>
            <p>لا توجد مواعيد قادمة خلال الثلاثة أسابيع القادمة.</p>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {dayGroups.map(([dayKey, dayEvents]) => (
            <section key={dayKey}>
              <h2 className="text-xs font-extrabold text-black/50 mb-2 px-1">{formatDayHeading(dayKey)}</h2>
              <div className="flex flex-col gap-2">
                {dayEvents.map((event) => (
                  <EventCard key={event.id} event={event} onEdit={setFormState} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <button
        onClick={() => setFormState('new')}
        className="fixed bottom-6 inset-x-0 mx-auto w-fit sm:end-6 sm:mx-0 flex items-center gap-2 rounded-full bg-apricot text-black font-bold pl-5 pr-4 py-3.5 shadow-card z-30"
      >
        <span className="text-xl leading-none">+</span>
        موعد جديد
      </button>

      {formState && (
        <EventForm
          initial={formState === 'new' ? null : formState}
          submitting={saving}
          onSubmit={handleSubmit}
          onClose={() => setFormState(null)}
        />
      )}
    </main>
  );
}

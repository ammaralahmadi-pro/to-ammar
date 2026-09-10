'use client';

import { useState } from 'react';

function toLocalInput(value) {
  const d = value ? new Date(value) : new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventForm({ initial, onSubmit, onClose, submitting }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [location, setLocation] = useState(initial?.location || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [allDay, setAllDay] = useState(initial?.allDay || false);
  const [startAt, setStartAt] = useState(toLocalInput(initial?.startAt));
  const [endAt, setEndAt] = useState(toLocalInput(initial?.endAt || addHour(initial?.startAt)));
  const [visibility, setVisibility] = useState(initial ? (initial.isFamilyEvent ? 'shared' : 'mine') : 'shared');
  const [error, setError] = useState('');

  function addHour(value) {
    const d = value ? new Date(value) : new Date();
    d.setHours(d.getHours() + 1);
    return d;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return setError('العنوان مطلوب.');
    if (new Date(endAt) < new Date(startAt)) return setError('وقت الانتهاء قبل وقت البداية.');
    setError('');
    onSubmit({ title: title.trim(), location: location.trim(), notes: notes.trim(), allDay, startAt, endAt, visibility });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-card max-h-[92vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-black/5">
          <h2 className="font-extrabold text-lg">{initial ? 'تعديل الموعد' : 'موعد جديد'}</h2>
          <button type="button" onClick={onClose} className="text-black/40 text-xl leading-none px-1" aria-label="إغلاق">
            ×
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          {error && <div className="rounded-lg bg-glaze px-3 py-2 text-sm text-black/80">{error}</div>}

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-black/50">العنوان</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: عشاء عائلي"
              className="rounded-xl border border-black/10 px-3.5 py-2.5 outline-none focus:border-apricot"
              autoFocus
            />
          </label>

          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="w-4 h-4 accent-apricot"
            />
            <span className="text-sm">طوال اليوم</span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-black/50">البداية</span>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? startAt.slice(0, 10) : startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="rounded-xl border border-black/10 px-3 py-2.5 outline-none focus:border-apricot text-sm"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-black/50">النهاية</span>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? endAt.slice(0, 10) : endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="rounded-xl border border-black/10 px-3 py-2.5 outline-none focus:border-apricot text-sm"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-black/50">المكان (اختياري)</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-xl border border-black/10 px-3.5 py-2.5 outline-none focus:border-apricot"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-black/50">ملاحظات (اختياري)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="rounded-xl border border-black/10 px-3.5 py-2.5 outline-none focus:border-apricot resize-none"
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-black/50">لمن هذا الموعد؟</span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={Boolean(initial)}
                onClick={() => setVisibility('shared')}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold border transition disabled:opacity-60 ${
                  visibility === 'shared' ? 'bg-apricot border-apricot text-black' : 'border-black/10 text-black/50'
                }`}
              >
                لكما معًا
              </button>
              <button
                type="button"
                disabled={Boolean(initial)}
                onClick={() => setVisibility('mine')}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold border transition disabled:opacity-60 ${
                  visibility === 'mine' ? 'bg-apricot border-apricot text-black' : 'border-black/10 text-black/50'
                }`}
              >
                لي وحدي
              </button>
            </div>
            {initial && (
              <span className="text-[11px] text-black/40">
                لا يمكن تغيير هذا بعد الإنشاء — احذف الموعد وأضفه من جديد لو احتجت تبدّله.
              </span>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white px-5 py-4 border-t border-black/5">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-apricot text-black font-bold py-3 shadow-card disabled:opacity-60"
          >
            {submitting ? 'جارٍ الحفظ…' : 'حفظ في Google Calendar'}
          </button>
        </div>
      </form>
    </div>
  );
}

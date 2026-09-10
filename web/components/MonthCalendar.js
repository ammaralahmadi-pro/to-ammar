'use client';

import { useMemo, useState } from 'react';

const WEEKDAY_LABELS = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
const MONTH_LABELS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

function buildGrid(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  return cells;
}

export default function MonthCalendar({ events, selectedDate, onSelectDate }) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const eventDateSet = useMemo(() => {
    const set = new Set();
    for (const e of events) set.add(new Date(e.startAt).toDateString());
    return set;
  }, [events]);

  const cells = useMemo(() => buildGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);
  const remainingDays = Math.max(0, Math.round((new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0) - today) / 86400000));

  function changeMonth(delta) {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  }

  return (
    <div className="rounded-2xl bg-[#20265a] border border-white/5 px-4 py-4">
      <div className="flex items-center justify-between">
        <button onClick={() => changeMonth(-1)} className="w-7 h-7 flex items-center justify-center text-white/40 text-lg" aria-label="الشهر السابق">
          ‹
        </button>
        <div className="text-center">
          <h2 className="font-extrabold text-[15px]">{MONTH_LABELS[cursor.getMonth()]} {cursor.getFullYear()}</h2>
          {cursor.getFullYear() === today.getFullYear() && cursor.getMonth() === today.getMonth() && (
            <p className="text-[11px] text-white/40 mt-0.5">باقي {remainingDays} يوم من الشهر</p>
          )}
        </div>
        <button onClick={() => changeMonth(1)} className="w-7 h-7 flex items-center justify-center text-white/40 text-lg" aria-label="الشهر القادم">
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-2 mt-4 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="text-[10px] font-bold text-white/30">{label}</span>
        ))}

        {cells.map((day, i) => {
          if (!day) return <span key={`blank-${i}`} />;
          const date = new Date(cursor.getFullYear(), cursor.getMonth(), day);
          const dateKey = date.toDateString();
          const isToday = dateKey === today.toDateString();
          const isSelected = selectedDate === dateKey;
          const hasEvent = eventDateSet.has(dateKey);
          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate?.(isSelected ? null : dateKey)}
              className="flex flex-col items-center gap-0.5 py-0.5"
            >
              <span
                className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold tabular-nums transition ${
                  isToday
                    ? 'bg-apricot text-white'
                    : isSelected
                    ? 'bg-white/15 text-white'
                    : 'text-white/70'
                }`}
              >
                {day}
              </span>
              <span className={`w-1 h-1 rounded-full ${hasEvent ? 'bg-warmyellow' : 'bg-transparent'}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

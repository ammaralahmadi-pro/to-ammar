import { monthLabel } from '../lib/format';

export default function MonthNav({ year, month, onChange }) {
  function shift(delta) {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    onChange(y, m);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => shift(-1)}
        className="w-9 h-9 rounded-lg bg-surface shadow-card flex items-center justify-center text-gray-500 hover:text-primary"
        aria-label="الشهر السابق"
      >
        ‹
      </button>
      <span className="font-display font-bold text-lg min-w-[9rem] text-center">
        {monthLabel(year, month)}
      </span>
      <button
        onClick={() => shift(1)}
        className="w-9 h-9 rounded-lg bg-surface shadow-card flex items-center justify-center text-gray-500 hover:text-primary"
        aria-label="الشهر التالي"
      >
        ›
      </button>
    </div>
  );
}

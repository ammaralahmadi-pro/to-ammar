'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatCurrency } from '../lib/format';

const SEVERITY = {
  over: { label: 'تجاوز الحد', dot: 'bg-danger', text: 'text-danger' },
  warning: { label: 'اقتراب من الحد', dot: 'bg-warning', text: 'text-warning' },
};

export default function AlertsPanel({ categories }) {
  const alerts = categories
    .filter((c) => c.status === 'over' || c.status === 'warning')
    .sort((a, b) => (a.status === 'over' ? -1 : 1) - (b.status === 'over' ? -1 : 1));

  return (
    <div className="bg-surface shadow-card rounded-2xl p-5">
      <h2 className="font-display font-bold mb-3">تنبيهات الفئات</h2>
      {alerts.length === 0 ? (
        <p className="text-gray-500 text-sm">كل الفئات ضمن حدودها المخطط لها 👍</p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((c, i) => {
            const sev = SEVERITY[c.status];
            return (
              <motion.li
                key={c.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
              >
                <Link
                  href={`/categories/${c.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-surface2 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${sev.dot}`} />
                    <span className="text-sm font-medium text-gray-800">{c.name}</span>
                  </span>
                  <span className={`text-xs font-semibold ${sev.text}`}>
                    {sev.label} · {formatCurrency(c.spent)} / {formatCurrency(c.planned)}
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

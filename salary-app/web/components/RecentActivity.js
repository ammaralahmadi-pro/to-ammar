'use client';

import { motion } from 'framer-motion';
import { formatCurrency, formatDate } from '../lib/format';

export default function RecentActivity({ expenses }) {
  const recent = expenses.slice(0, 6);

  return (
    <div className="bg-surface shadow-card rounded-2xl p-5">
      <h2 className="font-display font-bold mb-3">آخر المصروفات</h2>
      {recent.length === 0 ? (
        <p className="text-gray-500 text-sm">لا توجد مصروفات مسجّلة هذا الشهر بعد.</p>
      ) : (
        <ul className="space-y-1">
          {recent.map((expense, i) => (
            <motion.li
              key={expense.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-surface2 transition-colors"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium text-gray-800 truncate">
                  {expense.description || expense.category?.name || 'بدون وصف'}
                </span>
                <span className="block text-xs text-gray-500">
                  {expense.category?.name} · {formatDate(expense.date)}
                </span>
              </span>
              <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                {formatCurrency(expense.amount)}
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}

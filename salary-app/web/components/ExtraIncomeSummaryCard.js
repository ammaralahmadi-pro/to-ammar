'use client';

import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';
import { formatCurrency } from '../lib/format';

export default function ExtraIncomeSummaryCard({ total, monthsCount }) {
  if (!total) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface shadow-card rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap"
    >
      <div>
        <p className="font-display font-bold text-gray-800 mb-1">الدخل الإضافي المتراكم</p>
        <p className="text-gray-500 text-xs">
          مجموع البدلات والمكافآت اللي جتك عبر {monthsCount} {monthsCount === 1 ? 'شهر' : 'أشهر'}
        </p>
      </div>
      <p className="font-display font-extrabold text-2xl sm:text-3xl text-success">
        <AnimatedNumber value={total} format={formatCurrency} />
      </p>
    </motion.div>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { monthLabel } from '../lib/format';

export default function SalaryForm({ year, month, initialAmount, initialExtra, onSaved }) {
  const [amount, setAmount] = useState(initialAmount || '');
  const [extraIncome, setExtraIncome] = useState(initialExtra || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const value = Number(amount);
    if (!value || value <= 0) {
      setError('أدخل قيمة راتب صحيحة');
      return;
    }
    setLoading(true);
    try {
      await api.setSalary(year, month, { amount: value, extraIncome: Number(extraIncome) || 0 });
      onSaved();
    } catch {
      setError('تعذّر حفظ الراتب');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface shadow-card rounded-2xl p-6 max-w-md"
    >
      <h2 className="font-display font-bold text-lg mb-1">أدخل راتبك لشهر {monthLabel(year, month)}</h2>
      <p className="text-gray-500 text-sm mb-4">سيتم توزيعه تلقائيًا على فئاتك المحددة.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">صافي الراتب (ر.س)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">دخل إضافي (بدلات/مكافآت — اختياري)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={extraIncome}
            onChange={(e) => setExtraIncome(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2"
          />
        </div>
        {error && <p className="text-danger text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primarydark text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'جارِ الحفظ...' : 'حفظ وتوزيع'}
        </button>
      </form>
    </motion.div>
  );
}

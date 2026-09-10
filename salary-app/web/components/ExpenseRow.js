'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate } from '../lib/format';

export default function ExpenseRow({ expense, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ amount: String(expense.amount), description: expense.description || '' });
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return;
    setSaving(true);
    try {
      await onUpdate(expense.id, { amount, description: form.description });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <motion.form
        layout
        onSubmit={handleSave}
        className="flex flex-wrap items-center gap-2 px-4 py-3"
      >
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="الوصف"
          className="flex-1 min-w-[8rem] border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
          autoFocus
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="w-28 border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
        />
        <button type="button" onClick={() => setEditing(false)} className="text-gray-500 text-sm font-medium px-2">
          إلغاء
        </button>
        <button type="submit" disabled={saving} className="text-primary text-sm font-semibold px-2 disabled:opacity-50">
          {saving ? 'جارِ الحفظ...' : 'حفظ'}
        </button>
      </motion.form>
    );
  }

  return (
    <motion.div layout className="flex items-center justify-between px-4 py-3">
      <button className="text-start flex-1" onClick={() => setEditing(true)}>
        <p className="font-medium text-gray-800">{expense.description || 'بدون وصف'}</p>
        <p className="text-sm text-gray-400">{formatDate(expense.date)}</p>
      </button>
      <div className="flex items-center gap-4">
        <button onClick={() => setEditing(true)} className="font-semibold hover:text-primary transition-colors">
          {formatCurrency(expense.amount)}
        </button>
        <button onClick={() => onDelete(expense.id)} className="text-danger text-sm font-medium">
          حذف
        </button>
      </div>
    </motion.div>
  );
}

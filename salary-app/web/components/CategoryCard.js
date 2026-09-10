'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatCurrency } from '../lib/format';

const STATUS_STYLES = {
  ok: { bar: 'bg-success', text: 'text-success' },
  warning: { bar: 'bg-warning', text: 'text-warning' },
  over: { bar: 'bg-danger', text: 'text-danger' },
};

export default function CategoryCard({ category, onUpdate, onQuickAdd }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: category.name, type: category.type, value: String(category.value) });
  const [saving, setSaving] = useState(false);
  const [quickAmount, setQuickAmount] = useState('');
  const [addingExpense, setAddingExpense] = useState(false);
  const style = STATUS_STYLES[category.status] || STATUS_STYLES.ok;
  const percent = Math.min(category.percentUsed * 100, 100);

  async function handleQuickAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    const amount = Number(quickAmount);
    if (!amount || amount <= 0) return;
    setAddingExpense(true);
    try {
      await onQuickAdd(category.id, amount);
      setQuickAmount('');
    } finally {
      setAddingExpense(false);
    }
  }

  function startEdit(e) {
    e.preventDefault();
    e.stopPropagation();
    setForm({ name: category.name, type: category.type, value: String(category.value) });
    setEditing(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    e.stopPropagation();
    const value = Number(form.value);
    if (!form.name.trim() || !value || value <= 0) return;
    setSaving(true);
    try {
      await onUpdate(category.id, { name: form.name, type: form.type, value });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="bg-surface shadow-card rounded-xl p-4 relative"
    >
      {editing ? (
        <form onSubmit={handleSave} className="space-y-3" onClick={(e) => e.stopPropagation()}>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-semibold"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: 'percentage' })}
              className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${form.type === 'percentage' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600'}`}
            >
              نسبة %
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: 'fixed' })}
              className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${form.type === 'fixed' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600'}`}
            >
              مبلغ ثابت
            </button>
          </div>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setEditing(false); }}
              className="flex-1 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-semibold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-50"
            >
              {saving ? 'جارِ الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      ) : (
        <Link href={`/categories/${category.id}`} className="block">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-800">{category.name}</span>
            <div className="flex items-center gap-2">
              {category.status === 'over' && (
                <span className="text-xs font-bold text-danger bg-danger/10 px-2 py-0.5 rounded-full">تجاوز الحد</span>
              )}
              {category.status === 'warning' && (
                <span className="text-xs font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-full">اقتراب من الحد</span>
              )}
              <button
                onClick={startEdit}
                className="text-gray-300 hover:text-primary transition-colors"
                aria-label="تعديل الفئة"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
            <motion.div
              className={`h-full ${style.bar}`}
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className={`font-medium ${style.text}`}>{formatCurrency(category.spent)}</span>
            <span className="text-gray-400">من {formatCurrency(category.planned)}</span>
          </div>
        </Link>
      )}

      {!editing && onQuickAdd && (
        <form
          onSubmit={handleQuickAdd}
          className="flex gap-2 mt-3 pt-3 border-t border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="number"
            min="0"
            step="0.01"
            value={quickAmount}
            onChange={(e) => setQuickAmount(e.target.value)}
            placeholder="أضف مصروف سريع..."
            className="flex-1 min-w-0 border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
          />
          <button
            type="submit"
            disabled={addingExpense}
            className="bg-primary hover:bg-primarydark text-white text-sm font-semibold px-3 rounded-lg disabled:opacity-50"
          >
            +
          </button>
        </form>
      )}
    </motion.div>
  );
}

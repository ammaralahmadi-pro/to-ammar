'use client';

import { Fragment, useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../lib/format';
import { CATEGORY_GROUPS } from '../lib/categoryGroups';

function EditRow({ category, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: category.name,
    type: category.type,
    value: String(category.value),
    group: category.group || 'variable',
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const value = Number(form.value);
    if (!form.name.trim() || !value || value <= 0) return;
    setSaving(true);
    try {
      await onSave({ name: form.name, type: form.type, value, group: form.group });
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="bg-gray-50/5">
      <td colSpan={5} className="px-3 py-3">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="flex-1 min-w-[120px] border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
            autoFocus
          />
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: 'percentage' })}
              className={`px-2 py-1.5 rounded-lg border text-xs font-semibold ${form.type === 'percentage' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600'}`}
            >
              نسبة %
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: 'fixed' })}
              className={`px-2 py-1.5 rounded-lg border text-xs font-semibold ${form.type === 'fixed' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600'}`}
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
            className="w-28 border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
          />
          <select
            value={form.group}
            onChange={(e) => setForm({ ...form, group: e.target.value })}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs"
          >
            {CATEGORY_GROUPS.map((g) => (
              <option key={g.key} value={g.key}>{g.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-semibold"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-50"
          >
            {saving ? 'جارِ الحفظ...' : 'حفظ'}
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function BudgetTable({ title, hint, items, polarity, onUpdate, onQuickAdd }) {
  const [editingId, setEditingId] = useState(null);
  const [quickAddId, setQuickAddId] = useState(null);
  const [quickAmount, setQuickAmount] = useState('');

  if (items.length === 0) return null;

  const totals = items.reduce(
    (acc, c) => {
      acc.planned += c.planned;
      acc.spent += c.spent;
      return acc;
    },
    { planned: 0, spent: 0 }
  );
  const totalDiff = totals.spent - totals.planned;
  const totalGood = polarity === 'higherBetter' ? totalDiff >= 0 : totalDiff <= 0;

  async function submitQuickAdd(e, categoryId) {
    e.preventDefault();
    const amount = Number(quickAmount);
    if (!amount || amount <= 0) return;
    await onQuickAdd(categoryId, amount);
    setQuickAmount('');
    setQuickAddId(null);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface shadow-card rounded-xl overflow-hidden mb-6"
    >
      <div className="px-4 pt-4 pb-2 flex items-baseline gap-2">
        <h3 className="font-display font-bold">{title}</h3>
        <span className="text-xs text-gray-500">{hint}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs border-b border-gray-100">
              <th className="text-right font-medium px-4 py-2">البند</th>
              <th className="text-right font-medium px-3 py-2">الهدف</th>
              <th className="text-right font-medium px-3 py-2">الفعلي</th>
              <th className="text-right font-medium px-3 py-2">الفرق عن الهدف</th>
              <th className="text-center font-medium px-3 py-2 w-8">⚑</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => {
              if (editingId === c.id) {
                return (
                  <EditRow
                    key={c.id}
                    category={c}
                    onCancel={() => setEditingId(null)}
                    onSave={async (updates) => {
                      await onUpdate(c.id, updates);
                      setEditingId(null);
                    }}
                  />
                );
              }
              const diff = c.spent - c.planned;
              const good = polarity === 'higherBetter' ? diff >= 0 : diff <= 0;
              const diffColor = diff === 0 ? 'text-gray-500' : good ? 'text-success' : 'text-danger';
              return (
                <Fragment key={c.id}>
                  <tr className="border-b border-gray-100/50 last:border-0">
                    <td className="px-4 py-2.5 font-medium text-gray-800">{c.name}</td>
                    <td className="px-3 py-2.5 text-gray-600">{formatCurrency(c.planned)}</td>
                    <td className="px-3 py-2.5 text-gray-600">{formatCurrency(c.spent)}</td>
                    <td className={`px-3 py-2.5 font-medium ${diffColor}`}>
                      {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {diff !== 0 && <span className={diffColor}>⚑</span>}
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-2 justify-end">
                        {onQuickAdd && (
                          <button
                            onClick={() => setQuickAddId(quickAddId === c.id ? null : c.id)}
                            className="text-gray-300 hover:text-primary transition-colors"
                            aria-label="أضف مصروف"
                          >
                            +
                          </button>
                        )}
                        <button
                          onClick={() => setEditingId(c.id)}
                          className="text-gray-300 hover:text-primary transition-colors"
                          aria-label="تعديل الفئة"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {quickAddId === c.id && (
                    <tr className="bg-gray-50/5">
                      <td colSpan={6} className="px-4 py-2">
                        <form onSubmit={(e) => submitQuickAdd(e, c.id)} className="flex gap-2 max-w-xs mr-auto">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={quickAmount}
                            onChange={(e) => setQuickAmount(e.target.value)}
                            placeholder="أضف مصروف سريع..."
                            className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="bg-primary hover:bg-primarydark text-white text-sm font-semibold px-3 rounded-lg"
                          >
                            إضافة
                          </button>
                        </form>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-100 font-bold text-gray-800 bg-gray-50/5">
              <td className="px-4 py-2.5">الإجمالي</td>
              <td className="px-3 py-2.5">{formatCurrency(totals.planned)}</td>
              <td className="px-3 py-2.5">{formatCurrency(totals.spent)}</td>
              <td className={`px-3 py-2.5 ${totalDiff === 0 ? 'text-gray-500' : totalGood ? 'text-success' : 'text-danger'}`}>
                {totalDiff > 0 ? '+' : ''}{formatCurrency(totalDiff)}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </motion.div>
  );
}

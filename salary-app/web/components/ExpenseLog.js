'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate } from '../lib/format';

export default function ExpenseLog({ expenses, categories, onUpdate, onDelete }) {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ amount: '', description: '' });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return expenses.filter((e) => {
      if (categoryId && e.categoryId !== categoryId) return false;
      if (!term) return true;
      return (
        (e.description || '').toLowerCase().includes(term) ||
        (e.category?.name || '').toLowerCase().includes(term)
      );
    });
  }, [expenses, search, categoryId]);

  function startEdit(expense) {
    setEditingId(expense.id);
    setForm({ amount: String(expense.amount), description: expense.description || '' });
  }

  async function handleSave(id) {
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return;
    await onUpdate(id, { amount, description: form.description });
    setEditingId(null);
  }

  return (
    <div className="bg-surface shadow-card rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-display font-bold text-lg">سجل المصروفات</h2>
        <div className="flex flex-wrap gap-2">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-lg px-3 py-1.5 text-sm border border-gray-200"
          >
            <option value="">كل الفئات</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث..."
            className="rounded-lg px-3 py-1.5 text-sm border border-gray-200 w-40"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm py-6 text-center">لا توجد مصروفات مطابقة.</p>
      ) : (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-100">
                <th className="text-start font-medium px-5 py-2">الفئة</th>
                <th className="text-start font-medium px-5 py-2">الملاحظة</th>
                <th className="text-start font-medium px-5 py-2">التاريخ</th>
                <th className="text-start font-medium px-5 py-2">المبلغ</th>
                <th className="px-5 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((expense, i) => (
                <motion.tr
                  key={expense.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15, delay: i * 0.02 }}
                  className="border-b border-gray-100 last:border-0 hover:bg-surface2 transition-colors"
                >
                  <td className="px-5 py-2.5 text-gray-700 whitespace-nowrap">{expense.category?.name || '—'}</td>
                  {editingId === expense.id ? (
                    <>
                      <td className="px-5 py-2.5">
                        <input
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          className="rounded-lg px-2 py-1 text-sm border border-gray-200 w-full"
                          autoFocus
                        />
                      </td>
                      <td className="px-5 py-2.5 text-gray-500 whitespace-nowrap">{formatDate(expense.date)}</td>
                      <td className="px-5 py-2.5">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.amount}
                          onChange={(e) => setForm({ ...form, amount: e.target.value })}
                          className="rounded-lg px-2 py-1 text-sm border border-gray-200 w-24"
                        />
                      </td>
                      <td className="px-5 py-2.5 whitespace-nowrap">
                        <button onClick={() => setEditingId(null)} className="text-gray-500 text-xs font-medium ms-2">إلغاء</button>
                        <button onClick={() => handleSave(expense.id)} className="text-primary text-xs font-semibold ms-2">حفظ</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-2.5 text-gray-800">{expense.description || '—'}</td>
                      <td className="px-5 py-2.5 text-gray-500 whitespace-nowrap">{formatDate(expense.date)}</td>
                      <td className="px-5 py-2.5 font-semibold text-gray-800 whitespace-nowrap">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-5 py-2.5 whitespace-nowrap">
                        <button onClick={() => startEdit(expense)} className="text-primary text-xs font-medium ms-2">تعديل</button>
                        <button onClick={() => onDelete(expense.id)} className="text-danger text-xs font-medium ms-2">حذف</button>
                      </td>
                    </>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

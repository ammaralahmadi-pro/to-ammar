'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Shell from '../../components/Shell';
import { api } from '../../lib/api';

const EMPTY_FORM = { name: '', type: 'percentage', value: '' };

export default function SetupPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const res = await api.listCategories();
    setCategories(res.categories);
    setLoading(false);
  }

  useEffect(() => {
    api
      .me()
      .then(load)
      .catch(() => router.replace('/login'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const percentTotal = categories
    .filter((c) => c.type === 'percentage')
    .reduce((sum, c) => sum + c.value, 0);

  function startEdit(category) {
    setEditingId(category.id);
    setForm({ name: category.name, type: category.type, value: String(category.value) });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const value = Number(form.value);
    if (!form.name.trim() || !value || value <= 0) {
      setError('أدخل اسمًا وقيمة صحيحة');
      return;
    }
    try {
      if (editingId) {
        await api.updateCategory(editingId, { name: form.name, type: form.type, value });
      } else {
        await api.createCategory({ name: form.name, type: form.type, value });
      }
      cancelEdit();
      load();
    } catch {
      setError('تعذّر حفظ الفئة');
    }
  }

  async function handleDelete(id) {
    if (!confirm('حذف هذه الفئة؟ ستُحذف كل مصروفاتها المرتبطة بها.')) return;
    await api.deleteCategory(id);
    load();
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">جارِ التحميل...</div>;
  }

  return (
    <Shell>
      <h1 className="font-display font-extrabold text-2xl mb-6">الراتب والفئات</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface shadow-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold">فئات التوزيع</h2>
            <span className={`text-sm font-medium ${percentTotal > 100 ? 'text-danger' : 'text-gray-500'}`}>
              إجمالي النسب: {percentTotal}%
            </span>
          </div>

          {categories.length === 0 ? (
            <p className="text-gray-500 text-sm">لا توجد فئات بعد. أضف أول فئة من النموذج.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              <AnimatePresence>
                {categories.map((c) => (
                  <motion.li
                    key={c.id}
                    layout
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{c.name}</p>
                      <p className="text-sm text-gray-500">
                        {c.type === 'percentage' ? `${c.value}% من الراتب` : `${c.value} ر.س ثابت`}
                      </p>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <button onClick={() => startEdit(c)} className="text-primary font-medium">تعديل</button>
                      <button onClick={() => handleDelete(c.id)} className="text-danger font-medium">حذف</button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        <div className="bg-surface shadow-card rounded-2xl p-6">
          <h2 className="font-display font-bold mb-4">{editingId ? 'تعديل الفئة' : 'إضافة فئة جديدة'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم الفئة</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">طريقة التوزيع</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'percentage' })}
                  className={`flex-1 py-2 rounded-lg border text-sm font-semibold ${
                    form.type === 'percentage' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  نسبة مئوية
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'fixed' })}
                  className={`flex-1 py-2 rounded-lg border text-sm font-semibold ${
                    form.type === 'fixed' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  مبلغ ثابت
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {form.type === 'percentage' ? 'النسبة (%)' : 'المبلغ (ر.س)'}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>
            {error && <p className="text-danger text-sm">{error}</p>}
            <div className="flex gap-2">
              {editingId && (
                <button type="button" onClick={cancelEdit} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-semibold">
                  إلغاء
                </button>
              )}
              <button type="submit" className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primarydark hover:shadow-glow text-white font-semibold">
                {editingId ? 'حفظ التعديل' : 'إضافة الفئة'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Shell>
  );
}

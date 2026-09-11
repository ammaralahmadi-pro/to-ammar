'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Shell from '../../components/Shell';
import { api } from '../../lib/api';
import { CATEGORY_GROUPS } from '../../lib/categoryGroups';

const EMPTY_FORM = { name: '', type: 'percentage', value: '', group: 'variable' };
const DEFAULT_TEMPLATE = { needs: 50, wants: 30, savings: 20 };

export default function SetupPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [templateError, setTemplateError] = useState('');
  const [templateSaving, setTemplateSaving] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [autoSavePercent, setAutoSavePercent] = useState('20');
  const [settingsSaving, setSettingsSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await api.listCategories();
    setCategories(res.categories);
    setLoading(false);
  }

  useEffect(() => {
    api
      .me()
      .then((res) => {
        setAutoSaveEnabled(res.user.autoSaveEnabled);
        setAutoSavePercent(String(res.user.autoSavePercent));
        return load();
      })
      .catch(() => router.replace('/login'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const templateTotal = Number(template.needs || 0) + Number(template.wants || 0) + Number(template.savings || 0);

  async function handleApplyTemplate() {
    setTemplateError('');
    if (Math.round(templateTotal) !== 100) {
      setTemplateError('مجموع النسب لازم يكون 100%');
      return;
    }
    setTemplateSaving(true);
    try {
      await api.applyBudgetTemplate({
        needs: Number(template.needs),
        wants: Number(template.wants),
        savings: Number(template.savings),
      });
      await load();
    } catch {
      setTemplateError('تعذّر تطبيق القالب');
    } finally {
      setTemplateSaving(false);
    }
  }

  async function handleSaveSettings() {
    setSettingsSaving(true);
    try {
      await api.updateSettings({
        autoSaveEnabled,
        autoSavePercent: Number(autoSavePercent) || 0,
      });
    } finally {
      setSettingsSaving(false);
    }
  }

  const percentTotal = categories
    .filter((c) => c.type === 'percentage')
    .reduce((sum, c) => sum + c.value, 0);

  function startEdit(category) {
    setEditingId(category.id);
    setForm({ name: category.name, type: category.type, value: String(category.value), group: category.group || 'variable' });
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
        await api.updateCategory(editingId, { name: form.name, type: form.type, value, group: form.group });
      } else {
        await api.createCategory({ name: form.name, type: form.type, value, group: form.group });
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-surface shadow-card rounded-2xl p-6">
          <h2 className="font-display font-bold mb-1">قالب 50/30/20</h2>
          <p className="text-sm text-gray-500 mb-4">
            يضيف 3 فئات نسبية جاهزة (احتياجات/رغبات/ادخار) بجانب فئاتك الحالية دون حذف أي شيء.
          </p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">احتياجات %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={template.needs}
                onChange={(e) => setTemplate({ ...template, needs: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">رغبات %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={template.wants}
                onChange={(e) => setTemplate({ ...template, wants: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">ادخار %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={template.savings}
                onChange={(e) => setTemplate({ ...template, savings: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          <p className={`text-xs mb-3 ${templateTotal === 100 ? 'text-gray-500' : 'text-danger'}`}>
            المجموع: {templateTotal}%
          </p>
          {templateError && <p className="text-danger text-sm mb-3">{templateError}</p>}
          <button
            onClick={handleApplyTemplate}
            disabled={templateSaving}
            className="w-full py-2.5 rounded-lg bg-primary hover:bg-primarydark hover:shadow-glow text-white font-semibold disabled:opacity-50"
          >
            {templateSaving ? 'جارِ التطبيق...' : 'تطبيق القالب'}
          </button>
        </div>

        <div className="bg-surface shadow-card rounded-2xl p-6">
          <h2 className="font-display font-bold mb-1">الادخار التلقائي (ادفع لنفسك أولاً)</h2>
          <p className="text-sm text-gray-500 mb-4">
            عند تفعيله، بمجرد حفظ راتب الشهر يُسجَّل تلقائيًا مصروف بنسبة من دخلك في أول فئة ادخار عندك — كأنك ادخرته فورًا.
          </p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">تفعيل الادخار التلقائي</span>
            <button
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              className={`w-12 h-7 rounded-full transition-colors relative ${autoSaveEnabled ? 'bg-primary' : 'bg-gray-200'}`}
              aria-pressed={autoSaveEnabled}
            >
              <motion.span
                layout
                className="absolute top-1 w-5 h-5 rounded-full bg-white"
                style={{ [autoSaveEnabled ? 'right' : 'left']: 4 }}
              />
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">النسبة المقتطعة (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={autoSavePercent}
              onChange={(e) => setAutoSavePercent(e.target.value)}
              disabled={!autoSaveEnabled}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 disabled:opacity-50"
            />
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={settingsSaving}
            className="w-full py-2.5 rounded-lg bg-primary hover:bg-primarydark hover:shadow-glow text-white font-semibold disabled:opacity-50"
          >
            {settingsSaving ? 'جارِ الحفظ...' : 'حفظ الإعداد'}
          </button>
        </div>
      </div>

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
            <div className="space-y-6">
              {CATEGORY_GROUPS.map((g) => {
                const items = categories.filter((c) => (c.group || 'variable') === g.key);
                if (items.length === 0) return null;
                return (
                  <div key={g.key}>
                    <h3 className="text-sm font-bold text-gray-600 mb-1">{g.label}</h3>
                    <p className="text-xs text-gray-400 mb-2">{g.hint}</p>
                    <ul className="divide-y divide-gray-100">
                      <AnimatePresence>
                        {items.map((c) => (
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
                  </div>
                );
              })}
            </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">المجموعة</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_GROUPS.map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setForm({ ...form, group: g.key })}
                    className={`py-2 rounded-lg border text-xs font-semibold ${
                      form.group === g.key ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
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

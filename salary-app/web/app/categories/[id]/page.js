'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Shell from '../../../components/Shell';
import MonthNav from '../../../components/MonthNav';
import AddExpenseModal from '../../../components/AddExpenseModal';
import CategoryGauge from '../../../components/CategoryGauge';
import ExpenseRow from '../../../components/ExpenseRow';
import { api } from '../../../lib/api';
import { formatCurrency } from '../../../lib/format';

function currentPeriod() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export default function CategoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [period, setPeriod] = useState(currentPeriod);
  const [category, setCategory] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [dashboard, expensesRes, categoriesRes] = await Promise.all([
      api.getDashboard(period.year, period.month),
      api.listExpenses(period.year, period.month, id),
      api.listCategories(),
    ]);
    setCategory(dashboard.categories.find((c) => c.id === id) || null);
    setExpenses(expensesRes.expenses);
    setCategories(categoriesRes.categories);
    setLoading(false);
  }, [period, id]);

  useEffect(() => {
    api
      .me()
      .then(load)
      .catch(() => router.replace('/login'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  async function handleDeleteExpense(expenseId) {
    if (!confirm('حذف هذا المصروف؟')) return;
    await api.deleteExpense(expenseId);
    load();
  }

  async function handleUpdateExpense(expenseId, updates) {
    await api.updateExpense(expenseId, updates);
    await load();
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">جارِ التحميل...</div>;
  }

  if (!category) {
    return (
      <Shell>
        <p className="text-gray-500">هذه الفئة غير متاحة لهذا الشهر.</p>
      </Shell>
    );
  }

  return (
    <Shell onAddExpense={() => setShowAddExpense(true)}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-display font-extrabold text-2xl">{category.name}</h1>
        <MonthNav year={period.year} month={period.month} onChange={(year, month) => setPeriod({ year, month })} />
      </div>

      <motion.div
        key={`${period.year}-${period.month}-${id}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 mb-8 items-center">
          <div className="bg-surface shadow-card rounded-2xl p-5 flex justify-center">
            <CategoryGauge planned={category.planned} spent={category.spent} status={category.status} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface shadow-card rounded-2xl p-5">
              <p className="text-gray-500 text-sm mb-1">المخطط</p>
              <p className="font-display font-bold text-xl">{formatCurrency(category.planned)}</p>
            </div>
            <div className="bg-surface shadow-card rounded-2xl p-5">
              <p className="text-gray-500 text-sm mb-1">الفعلي</p>
              <p className="font-display font-bold text-xl">{formatCurrency(category.spent)}</p>
            </div>
            <div className="bg-surface shadow-card rounded-2xl p-5">
              <p className="text-gray-500 text-sm mb-1">المتبقي</p>
              <p className={`font-display font-bold text-xl ${category.remaining < 0 ? 'text-danger' : ''}`}>
                {formatCurrency(category.remaining)}
              </p>
            </div>
          </div>
        </div>

        <h2 className="font-display font-bold mb-3">المصروفات</h2>
        <p className="text-gray-400 text-xs mb-3">اضغط على أي مصروف لتعديله مباشرة.</p>
        {expenses.length === 0 ? (
          <p className="text-gray-500 text-sm">لا توجد مصروفات مسجّلة في هذه الفئة لهذا الشهر.</p>
        ) : (
          <div className="bg-surface shadow-card rounded-2xl divide-y divide-gray-100">
            <AnimatePresence>
              {expenses.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  onUpdate={handleUpdateExpense}
                  onDelete={handleDeleteExpense}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showAddExpense && (
          <AddExpenseModal
            categories={categories}
            defaultCategoryId={id}
            onClose={() => setShowAddExpense(false)}
            onSaved={() => {
              setShowAddExpense(false);
              load();
            }}
          />
        )}
      </AnimatePresence>
    </Shell>
  );
}

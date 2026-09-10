'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Shell from '../../components/Shell';
import MonthNav from '../../components/MonthNav';
import CategoryCard from '../../components/CategoryCard';
import SalaryForm from '../../components/SalaryForm';
import AddExpenseModal from '../../components/AddExpenseModal';
import AllocationDonut from '../../components/AllocationDonut';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/format';

function currentPeriod() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export default function DashboardPage() {
  const router = useRouter();
  const [period, setPeriod] = useState(currentPeriod);
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [dashboard, cats] = await Promise.all([
      api.getDashboard(period.year, period.month),
      api.listCategories(),
    ]);
    setData(dashboard);
    setCategories(cats.categories);
    setLoading(false);
  }, [period]);

  useEffect(() => {
    api
      .me()
      .then(() => setAuthChecked(true))
      .catch(() => router.replace('/login'));
  }, [router]);

  useEffect(() => {
    if (authChecked) load();
  }, [authChecked, load]);

  async function handleUpdateCategory(id, updates) {
    await api.updateCategory(id, updates);
    await load();
  }

  if (!authChecked || loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">جارِ التحميل...</div>
    );
  }

  const savingCategory = data.categories.find((c) => c.name.includes('ادخار'));
  const deficit = data.totalRemaining < 0 ? Math.abs(data.totalRemaining) : 0;

  return (
    <Shell onAddExpense={categories.length ? () => setShowAddExpense(true) : undefined}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-display font-extrabold text-2xl">لوحة المتابعة</h1>
        <MonthNav year={period.year} month={period.month} onChange={(year, month) => setPeriod({ year, month })} />
      </div>

      {!data.hasSalary ? (
        categories.length === 0 ? (
          <div className="bg-surface shadow-card rounded-2xl p-8 max-w-md text-center">
            <p className="text-gray-600 mb-4">لم تُضِف أي فئات مصروفات بعد.</p>
            <a href="/setup" className="text-primary font-semibold">اذهب إلى إعداد الفئات ←</a>
          </div>
        ) : (
          <SalaryForm year={period.year} month={period.month} onSaved={load} />
        )
      ) : (
        <motion.div
          key={`${period.year}-${period.month}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-surface shadow-card rounded-2xl p-6">
              <p className="text-gray-500 text-sm mb-1">المتبقي من الشهر</p>
              <p className={`font-display font-extrabold text-3xl ${data.totalRemaining < 0 ? 'text-danger' : 'text-gray-900'}`}>
                {formatCurrency(data.totalRemaining)}
              </p>
            </div>
            <div className="bg-surface shadow-card rounded-2xl p-6">
              <p className="text-gray-500 text-sm mb-1">
                {savingCategory ? 'الادخار الفعلي هذا الشهر' : 'إجمالي الدخل'}
              </p>
              <p className="font-display font-extrabold text-3xl text-success">
                {formatCurrency(savingCategory ? savingCategory.spent : data.totalIncome)}
              </p>
            </div>
            <div className="bg-surface shadow-card rounded-2xl p-4 flex items-center justify-center">
              <AllocationDonut categories={data.categories} totalIncome={data.totalIncome} totalSpent={data.totalSpent} />
            </div>
          </div>

          <AnimatePresence>
            {deficit > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-danger/10 rounded-xl px-4 py-3 mb-6 flex items-center justify-between gap-4 flex-wrap">
                  <span className="text-danger text-sm font-medium">
                    صرفت هذا الشهر أكثر من دخلك — راجع الفئات المتجاوزة أعلاه.
                  </span>
                  <span className="font-display font-extrabold text-danger text-lg">
                    عجز {formatCurrency(deficit)}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {data.unallocated > 1 && (
            <div className="bg-warning/10 text-warning text-sm font-medium rounded-xl px-4 py-3 mb-6">
              يوجد {formatCurrency(data.unallocated)} من راتبك غير موزَّع على أي فئة.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {data.categories.map((category) => (
                <CategoryCard key={category.id} category={category} onUpdate={handleUpdateCategory} />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showAddExpense && (
          <AddExpenseModal
            categories={categories}
            onClose={() => setShowAddExpense(false)}
            onSaved={() => {
              setShowAddExpense(false);
              load();
            }}
          />
        )}
      </AnimatePresence>

      {categories.length > 0 && (
        <button
          onClick={() => setShowAddExpense(true)}
          className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 bg-primary text-white font-semibold px-6 py-3 rounded-full shadow-card"
        >
          + إضافة مصروف
        </button>
      )}
    </Shell>
  );
}

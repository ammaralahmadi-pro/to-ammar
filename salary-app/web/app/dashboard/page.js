'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Shell from '../../components/Shell';
import MonthNav from '../../components/MonthNav';
import CategoryCard from '../../components/CategoryCard';
import BudgetTable from '../../components/BudgetTable';
import VarianceChart from '../../components/VarianceChart';
import TrendChart from '../../components/TrendChart';
import SalaryForm from '../../components/SalaryForm';
import AddExpenseModal from '../../components/AddExpenseModal';
import AllocationDonut from '../../components/AllocationDonut';
import AlertsPanel from '../../components/AlertsPanel';
import RecentActivity from '../../components/RecentActivity';
import StatStrip from '../../components/StatStrip';
import ExpenseLog from '../../components/ExpenseLog';
import IncomeSummaryCard from '../../components/IncomeSummaryCard';
import ExtraIncomeSummaryCard from '../../components/ExtraIncomeSummaryCard';
import FinancialScoreCards from '../../components/FinancialScoreCards';
import SavingsSuggestions from '../../components/SavingsSuggestions';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/format';
import { CATEGORY_GROUPS } from '../../lib/categoryGroups';

function currentPeriod() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export default function DashboardPage() {
  const router = useRouter();
  const [period, setPeriod] = useState(currentPeriod);
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [extraIncomeSummary, setExtraIncomeSummary] = useState({ total: 0, monthsCount: 0 });
  const [trend, setTrend] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    const [dashboard, cats, expensesRes, extraIncome, trendRes] = await Promise.all([
      api.getDashboard(period.year, period.month),
      api.listCategories(),
      api.listExpenses(period.year, period.month),
      api.getExtraIncomeSummary(),
      api.getTrend(6),
    ]);
    setData(dashboard);
    setCategories(cats.categories);
    setExpenses(expensesRes.expenses);
    setExtraIncomeSummary(extraIncome);
    setTrend(trendRes.trend);
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

  async function handleUpdateExpense(id, updates) {
    await api.updateExpense(id, updates);
    await load();
  }

  async function handleDeleteExpense(id) {
    if (!confirm('حذف هذا المصروف؟')) return;
    await api.deleteExpense(id);
    await load();
  }

  async function handleQuickAddExpense(categoryId, amount) {
    await api.createExpense({ categoryId, amount, date: new Date().toISOString().slice(0, 10) });
    await load();
  }

  if (!authChecked || loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">جارِ التحميل...</div>
    );
  }

  const savingCategory = data.categories.find((c) => c.name.includes('ادخار'));
  const deficit = data.totalRemaining < 0 ? Math.abs(data.totalRemaining) : 0;

  const featuredCategory = data.categories.find((c) => c.name.includes('طوارئ'));
  const otherCategories = featuredCategory
    ? data.categories.filter((c) => c.id !== featuredCategory.id)
    : data.categories;

  const okCategories = data.categories.filter((c) => c.status !== 'over').length;
  const budgetScore = data.categories.length
    ? Math.round((okCategories / data.categories.length) * 100)
    : null;

  const savingsScore = savingCategory
    ? Math.min(100, Math.round((savingCategory.spent / (savingCategory.planned || 1)) * 100))
    : data.totalIncome > 0
      ? Math.round(Math.max(0, data.totalRemaining / data.totalIncome) * 100)
      : null;

  const overallScore =
    budgetScore !== null && savingsScore !== null ? Math.round((budgetScore + savingsScore) / 2) : null;

  const scoreCards = [
    {
      title: 'الالتزام بالميزانية',
      description: 'يقيس نسبة الفئات اللي صرفك فيها لسا ضمن حدودها المخطط لها هذا الشهر.',
      score: budgetScore,
    },
    {
      title: savingCategory ? 'درجة الادخار' : 'درجة الفائض',
      description: savingCategory
        ? 'يقيس مدى التزامك بمبلغ الادخار المخطط له هذا الشهر.'
        : 'يقيس نسبة الفائض المتبقي من دخلك بعد كل المصروفات.',
      score: savingsScore,
    },
    {
      title: 'الصحة المالية العامة',
      description: 'مؤشر عام يجمع بين الالتزام بالميزانية والادخار لهذا الشهر.',
      score: overallScore,
    },
  ].filter((c) => c.score !== null);

  const stats = [
    {
      label: 'المتبقي من الشهر',
      value: data.totalRemaining,
      format: formatCurrency,
      color: data.totalRemaining < 0 ? 'text-danger' : 'text-gray-900',
    },
    { label: 'إجمالي الدخل', value: data.totalIncome, format: formatCurrency, color: 'text-gray-900' },
    ...(savingCategory
      ? [{ label: 'الادخار الفعلي', value: savingCategory.spent, format: formatCurrency, color: 'text-success' }]
      : []),
    { label: 'عدد الفئات', value: data.categories.length, format: (v) => Math.round(v).toLocaleString('en-US'), color: 'text-gray-900' },
    ...(deficit > 0 ? [{ label: 'عجز الشهر', value: deficit, format: formatCurrency, color: 'text-danger' }] : []),
  ];

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
          <div className="mb-6">
            <StatStrip items={stats} />
          </div>

          {data.unallocated > 1 && (
            <div className="bg-warning/10 text-warning text-sm font-medium rounded-xl px-4 py-3 mb-6">
              يوجد {formatCurrency(data.unallocated)} من راتبك غير موزَّع على أي فئة.
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-surface shadow-card rounded-2xl p-4 flex items-center justify-center">
              <AllocationDonut categories={data.categories} totalIncome={data.totalIncome} totalSpent={data.totalSpent} />
            </div>
            <AlertsPanel categories={data.categories} />
            <RecentActivity expenses={expenses} />
          </div>

          <div className="mb-8 space-y-4">
            <IncomeSummaryCard baseSalary={data.salary} extraIncome={data.extraIncome} />
            <ExtraIncomeSummaryCard total={extraIncomeSummary.total} monthsCount={extraIncomeSummary.monthsCount} />
          </div>

          {scoreCards.length > 0 && (
            <div className="mb-8">
              <h2 className="font-display font-bold text-lg mb-3">مؤشرات الصحة المالية</h2>
              <FinancialScoreCards cards={scoreCards} />
            </div>
          )}

          <SavingsSuggestions income={data.totalIncome} categories={data.categories} />

          <h2 className="font-display font-bold text-lg mb-3">تفصيل الفئات</h2>

          {featuredCategory && (
            <div className="mb-4">
              <CategoryCard
                category={featuredCategory}
                onUpdate={handleUpdateCategory}
                onQuickAdd={handleQuickAddExpense}
                featured
              />
            </div>
          )}

          {CATEGORY_GROUPS.map((g) => {
            const items = otherCategories.filter((c) => (c.group || 'variable') === g.key);
            if (items.length === 0) return null;
            return (
              <BudgetTable
                key={g.key}
                title={g.label}
                hint={g.hint}
                items={items}
                polarity={g.polarity}
                onUpdate={handleUpdateCategory}
                onQuickAdd={handleQuickAddExpense}
              />
            );
          })}

          {(() => {
            const variableItems = otherCategories.filter((c) => (c.group || 'variable') === 'variable');
            return variableItems.length > 0 ? (
              <VarianceChart title="المصاريف المتغيرة" items={variableItems} polarity="lowerBetter" />
            ) : null;
          })()}

          <TrendChart trend={trend} />

          <ExpenseLog
            expenses={expenses}
            categories={categories}
            onUpdate={handleUpdateExpense}
            onDelete={handleDeleteExpense}
          />
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
    </Shell>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../lib/format';

function Card({ title, tag, description, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface shadow-card rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display font-bold">{title}</h3>
        {tag && <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{tag}</span>}
      </div>
      <p className="text-xs text-gray-500 mb-3">{description}</p>
      {children}
    </motion.div>
  );
}

function Row({ label, value, color }) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${color || 'text-gray-800'}`}>{formatCurrency(value)}</span>
    </div>
  );
}

export default function SavingsSuggestions({ income: initialIncome, categories = [] }) {
  const [incomeInput, setIncomeInput] = useState(initialIncome ? String(initialIncome) : '');
  const [isSurplus, setIsSurplus] = useState(false);
  const income = Number(incomeInput) || 0;

  if (!initialIncome || initialIncome <= 0) return null;

  const needs = income * 0.5;
  const wants = income * 0.3;
  const savings20 = income * 0.2;

  const obligations = categories
    .filter((c) => c.group === 'debts' || c.group === 'bills')
    .reduce((sum, c) => sum + c.planned, 0);
  const surplus = income - obligations;
  const surplusWants = surplus > 0 ? surplus * 0.6 : 0;
  const surplusSavings = surplus > 0 ? surplus * 0.4 : 0;

  // "فائض صافي": المبلغ نفسه بعد ما خُصمت الالتزامات فعليًا، فما نطرح ولا نطبّق 50/30/20 عليه
  const netSurplus60 = income * 0.6;
  const netSurplus40 = income * 0.4;
  const netSurplusHalf = income * 0.5;
  const netSurplusPayFirst = income * 0.4;
  const netSurplusWeekly = income / 4;

  const payYourselfPercent = isSurplus ? 40 : 15;
  const payYourselfAmount = (income * payYourselfPercent) / 100;

  const weeklyEnvelope = isSurplus ? netSurplusWeekly : (income * 0.3) / 4;

  const escalationMonths = [2, 3, 4, 5].map((pct, i) => ({
    month: i + 1,
    pct,
    amount: (income * pct) / 100,
  }));

  const goalAmount = 10000;
  const goalMonths = 12;
  const goalMonthly = goalAmount / goalMonths;

  return (
    <div className="mb-8">
      <h2 className="font-display font-bold text-lg mb-3">مقترحات أنظمة توفير الراتب</h2>
      <p className="text-sm text-gray-500 mb-3">
        أمثلة محسوبة على المبلغ اللي تدخله (افتراضيًا دخلك الحالي)، جرّب أي نظام يناسبك.
      </p>
      <div className="flex items-center gap-2 mb-4 max-w-xs">
        <label className="text-sm text-gray-500 whitespace-nowrap">المبلغ (ر.س)</label>
        <input
          id="savings-suggestions-income"
          type="number"
          min="0"
          step="0.01"
          value={incomeInput}
          onChange={(e) => setIncomeInput(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
        />
        <button
          type="button"
          onClick={() => setIncomeInput(String(initialIncome))}
          className="text-xs text-primary font-semibold whitespace-nowrap"
        >
          إعادة تعيين
        </button>
      </div>

      <label className="flex items-center gap-2 mb-4 text-sm text-gray-500 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={isSurplus}
          onChange={(e) => setIsSurplus(e.target.checked)}
          className="accent-primary"
        />
        هذا المبلغ فائض صافي بعد الالتزامات (مو راتب كامل)
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isSurplus ? (
          <Card
            title="توزيع الفائض الصافي"
            tag="لمبلغ متبقي"
            description="التزاماتك مخصومة أصلاً من هذا المبلغ، فنوزّعه مباشرة بدل ما نطبّق نسب راتب كامل عليه."
          >
            <Row label="تقسيم 60% رغبات / 40% ادخار" value={netSurplus60} />
            <Row label="نفس التقسيم — الادخار" value={netSurplus40} color="text-success" />
            <Row label="تقسيم متوازن 50/50 لكل جانب" value={netSurplusHalf} />
            <Row label="ادفع لنفسك أولاً (40% ادخار)" value={netSurplusPayFirst} color="text-success" />
            <Row label="ظرف أسبوعي (÷4 أسابيع)" value={netSurplusWeekly} />
          </Card>
        ) : (
          <>
            <Card
              title="الفائض بعد الالتزامات"
              tag="مبني على فئاتك"
              description="دخلك مطروح منه الالتزامات والديون والفواتير الثابتة المخطط لها، مع توزيع مقترح للباقي."
            >
              <Row label="إجمالي الالتزامات والفواتير" value={obligations} />
              <Row label="الفائض المتبقي" value={surplus} color={surplus < 0 ? 'text-danger' : 'text-success'} />
              {surplus > 0 ? (
                <>
                  <Row label="مقترح لرغبات ورفاهية (60%)" value={surplusWants} />
                  <Row label="مقترح للادخار (40%)" value={surplusSavings} color="text-success" />
                </>
              ) : (
                <p className="text-xs text-danger mt-2">التزاماتك تتجاوز دخلك هذا الشهر — راجع فئات الالتزامات والفواتير.</p>
              )}
            </Card>

            <Card
              title="قاعدة 50/30/20"
              tag="الأكثر شيوعًا"
              description="نظام موزون: نصف الدخل للاحتياجات، والباقي بين الرغبات والادخار."
            >
              <Row label="احتياجات أساسية (50%)" value={needs} />
              <Row label="رغبات ورفاهية (30%)" value={wants} />
              <Row label="ادخار واستثمار (20%)" value={savings20} color="text-success" />
            </Card>
          </>
        )}

        {!isSurplus && (
          <Card
            title="ادفع لنفسك أولاً"
            tag="Pay Yourself First"
            description={`عامل الادخار كالتزام إجباري يُقتطع فور نزول الراتب، مثال بنسبة ${payYourselfPercent}%.`}
          >
            <Row label={`يُدَّخر فورًا (${payYourselfPercent}%)`} value={payYourselfAmount} color="text-success" />
            <Row label="يتبقى للعيش عليه" value={income - payYourselfAmount} />
          </Card>
        )}

        {!isSurplus && (
          <Card
            title="الأظرف الرقمية"
            tag="Envelopes"
            description="خصّص ميزانية أسبوعية ثابتة للمصاريف المتغيرة، وقف الصرف بمجرد نفادها."
          >
            <Row label="ميزانية أسبوعية مقترحة" value={weeklyEnvelope} />
            <p className="text-xs text-gray-500 mt-2">مبنية على 30% من دخلك مقسّمة على 4 أسابيع.</p>
          </Card>
        )}

        <Card
          title="الادخار التدريجي"
          tag="Escalation"
          description="ابدأ بنسبة صغيرة مريحة وزِدها تدريجيًا كل شهر لتعتاد عليها."
        >
          {escalationMonths.map((m) => (
            <Row key={m.month} label={`الشهر ${m.month} (${m.pct}%)`} value={m.amount} />
          ))}
        </Card>

        <Card
          title="الادخار بالأهداف"
          tag="Goal-Based"
          description={`مثال: لو هدفك جمع ${formatCurrency(goalAmount)} خلال ${goalMonths} شهر.`}
        >
          <Row label="الادخار الشهري المطلوب" value={goalMonthly} color="text-success" />
          <p className="text-xs text-gray-500 mt-2">
            {goalMonthly <= income * 0.3
              ? 'هذا الهدف واقعي بناءً على دخلك الحالي.'
              : 'هذا الهدف يحتاج نسبة عالية من دخلك — جرّب مدة أطول.'}
          </p>
        </Card>
      </div>
    </div>
  );
}

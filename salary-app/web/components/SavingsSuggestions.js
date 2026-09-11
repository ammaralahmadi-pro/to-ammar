'use client';

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

export default function SavingsSuggestions({ income }) {
  if (!income || income <= 0) return null;

  const needs = income * 0.5;
  const wants = income * 0.3;
  const savings20 = income * 0.2;

  const payYourselfPercent = 15;
  const payYourselfAmount = (income * payYourselfPercent) / 100;

  const weeklyEnvelope = (income * 0.3) / 4;

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
      <p className="text-sm text-gray-500 mb-4">أمثلة محسوبة فعليًا على دخلك الحالي ({formatCurrency(income)})، جرّب أي نظام يناسبك.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          title="قاعدة 50/30/20"
          tag="الأكثر شيوعًا"
          description="نظام موزون: نصف الدخل للاحتياجات، والباقي بين الرغبات والادخار."
        >
          <Row label="احتياجات أساسية (50%)" value={needs} />
          <Row label="رغبات ورفاهية (30%)" value={wants} />
          <Row label="ادخار واستثمار (20%)" value={savings20} color="text-success" />
        </Card>

        <Card
          title="ادفع لنفسك أولاً"
          tag="Pay Yourself First"
          description="عامل الادخار كالتزام إجباري يُقتطع فور نزول الراتب، مثال بنسبة 15%."
        >
          <Row label={`يُدَّخر فورًا (${payYourselfPercent}%)`} value={payYourselfAmount} color="text-success" />
          <Row label="يتبقى للعيش عليه" value={income - payYourselfAmount} />
        </Card>

        <Card
          title="الأظرف الرقمية"
          tag="Envelopes"
          description="خصّص ميزانية أسبوعية ثابتة للمصاريف المتغيرة، وقف الصرف بمجرد نفادها."
        >
          <Row label="ميزانية أسبوعية مقترحة" value={weeklyEnvelope} />
          <p className="text-xs text-gray-500 mt-2">مبنية على 30% من دخلك مقسّمة على 4 أسابيع.</p>
        </Card>

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

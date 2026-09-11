'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '../../components/Shell';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/format';

const MONTHS = [
  { label: 'سبتمبر (9) 2026', note: 'شامل الإضافي والدين' },
  { label: 'أكتوبر (10) 2026', note: null },
  { label: 'نوفمبر (11) 2026', note: null },
  { label: 'ديسمبر (12) 2026', note: 'اكتمال الهدف' },
];

const ROWS = [
  { label: '1. الإيرادات (الراتب + إضافي)', values: [15901, 12901, 12901, 12901], bold: true, colorClass: 'text-success' },
  { label: '2. الالتزامات الثابتة (إيجار وقروض)', values: [-10600, -10600, -10600, -10600] },
  { label: '3. سداد الدين الفوري', values: [-2500, 0, 0, 0] },
  { label: 'المتبقي للتحكم', values: [2801, 2301, 2301, 2301], bold: true, highlight: true, colorClass: 'text-warning' },
  { label: '4. قسط شي إن', values: [-544.11, -544.11, -544.11, -544.11] },
  {
    label: '5. تجميع المناسبات (شهريًا)',
    values: [-1375, -1375, -1375, -1375],
    notes: [null, null, null, 'اكتمال 5,500 ر.س'],
  },
  {
    label: '💰 6. بند الادخار (المتبقي النهائي)',
    values: [881.89, 381.89, 381.89, 381.89],
    bold: true,
    success: true,
    notes: [null, null, null, 'بالإضافة لفك حصالة الـ 5,500 ر.س'],
  },
];

function Cell({ value, bold, success, colorClass }) {
  if (value === 0) {
    return <span className="text-gray-500">{formatCurrency(0)}</span>;
  }
  const negative = value < 0;
  const text = negative ? `(${formatCurrency(Math.abs(value))})` : formatCurrency(value);
  const color = negative ? 'text-danger' : colorClass || (success ? 'text-success' : 'text-gray-800');
  return <span className={`${bold ? 'font-bold' : ''} ${color}`}>{text}</span>;
}

export default function PlanPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    api
      .me()
      .then(() => setAuthChecked(true))
      .catch(() => router.replace('/login'));
  }, [router]);

  if (!authChecked) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">جارِ التحميل...</div>;
  }

  return (
    <Shell>
      <h1 className="font-display font-extrabold text-2xl mb-2">الخطة المالية — سبتمبر إلى ديسمبر 2026</h1>
      <p className="text-sm text-gray-500 mb-6">
        خطة سداد الدين الفوري وتجميع مبلغ المناسبات على 4 أشهر، وصولًا لبند ادخار ثابت شهريًا.
      </p>

      <div className="bg-surface shadow-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-right font-medium text-gray-500 px-4 py-3">البيان / الشهر</th>
                {MONTHS.map((m) => (
                  <th key={m.label} className="text-right font-medium text-gray-500 px-4 py-3">
                    {m.label}
                    {m.note && <div className="text-xs font-normal text-gray-400 mt-0.5">({m.note})</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr
                  key={row.label}
                  className={`border-b border-gray-100/50 last:border-0 ${row.highlight ? 'bg-primary/5' : ''}`}
                >
                  <td className={`px-4 py-3 ${row.bold ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                    {row.label}
                  </td>
                  {row.values.map((value, i) => (
                    <td key={i} className="px-4 py-3">
                      <Cell value={value} bold={row.bold} success={row.success} colorClass={row.colorClass} />
                      {row.notes?.[i] && <div className="text-xs text-gray-400 mt-0.5">({row.notes[i]})</div>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}

'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../lib/format';

const GRADIENTS = {
  ok: ['#4ade80', '#16a34a'],
  warning: ['#fbbf24', '#f59e0b'],
  over: ['#f87171', '#dc2626'],
};

export default function AllocationDonut({ categories, totalIncome, totalSpent }) {
  const data = categories
    .filter((c) => c.planned > 0)
    .map((c) => ({ name: c.name, value: c.planned, status: c.status }));

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-56 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            {Object.entries(GRADIENTS).map(([status, [from, to]]) => (
              <linearGradient key={status} id={`donut-${status}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={from} />
                <stop offset="100%" stopColor={to} />
              </linearGradient>
            ))}
          </defs>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="90%"
            paddingAngle={2}
            animationDuration={700}
            animationBegin={100}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={`url(#donut-${entry.status || 'ok'})`} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [formatCurrency(value), name]}
            contentStyle={{ direction: 'rtl', textAlign: 'right', borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-gray-400 text-xs">الصرف الفعلي</span>
        <span className="font-display font-extrabold text-xl">{formatCurrency(totalSpent)}</span>
        <span className="text-gray-400 text-xs">من {formatCurrency(totalIncome)}</span>
      </div>
    </div>
  );
}

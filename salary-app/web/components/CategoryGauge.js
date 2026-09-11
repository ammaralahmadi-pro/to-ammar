'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const GRADIENTS = {
  ok: ['#4ade80', '#16a34a'],
  warning: ['#fbbf24', '#f59e0b'],
  over: ['#f87171', '#dc2626'],
};

export default function CategoryGauge({ planned, spent, status }) {
  const gradientId = `gauge-${status || 'ok'}`;
  const remaining = Math.max(planned - spent, 0);
  const overflow = Math.max(spent - planned, 0);

  const data = overflow > 0
    ? [{ value: planned, fill: `url(#${gradientId})` }, { value: overflow, fill: '#7f1d1d' }]
    : [{ value: spent, fill: `url(#${gradientId})` }, { value: remaining, fill: '#332821' }];

  return (
    <div className="w-32 h-32 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            {Object.entries(GRADIENTS).map(([key, [from, to]]) => (
              <linearGradient key={key} id={`gauge-${key}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={from} />
                <stop offset="100%" stopColor={to} />
              </linearGradient>
            ))}
          </defs>
          <Pie
            data={data}
            dataKey="value"
            innerRadius="68%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            animationDuration={700}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} stroke="none" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

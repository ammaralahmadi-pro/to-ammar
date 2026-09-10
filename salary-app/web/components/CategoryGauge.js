'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const STATUS_COLORS = { ok: '#16a34a', warning: '#f59e0b', over: '#dc2626' };

export default function CategoryGauge({ planned, spent, status }) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.ok;
  const remaining = Math.max(planned - spent, 0);
  const overflow = Math.max(spent - planned, 0);

  const data = overflow > 0
    ? [{ value: planned, fill: color }, { value: overflow, fill: '#7f1d1d' }]
    : [{ value: spent, fill: color }, { value: remaining, fill: '#e5e7eb' }];

  return (
    <div className="w-32 h-32 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
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

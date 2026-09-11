'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { formatCurrency } from '../lib/format';

export default function VarianceChart({ title, items, polarity }) {
  const data = items
    .filter((c) => c.planned > 0 || c.spent > 0)
    .map((c) => ({ name: c.name, diff: c.spent - c.planned }));

  if (data.length === 0) return null;

  return (
    <div className="bg-surface shadow-card rounded-xl p-4 mb-6">
      <h3 className="font-display font-bold mb-3">{title} — تحليل الفرق</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#84899e' }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11, fill: '#84899e' }} />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ direction: 'rtl', textAlign: 'right', borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.3)' }}
            />
            <Bar dataKey="diff" radius={[4, 4, 4, 4]}>
              {data.map((entry, i) => {
                const good = polarity === 'higherBetter' ? entry.diff >= 0 : entry.diff <= 0;
                return <Cell key={i} fill={entry.diff === 0 ? '#42475d' : good ? '#22c55e' : '#ef4444'} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

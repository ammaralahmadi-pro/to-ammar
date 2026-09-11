'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency, MONTH_NAMES } from '../lib/format';

export default function TrendChart({ trend }) {
  if (!trend || trend.length === 0) return null;

  const data = trend.map((t) => ({
    ...t,
    label: MONTH_NAMES[t.month - 1],
  }));

  return (
    <div className="bg-surface shadow-card rounded-xl p-4 mb-6">
      <h3 className="font-display font-bold mb-3">دخل / مصروف والرصيد التراكمي</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#84899e' }} />
            <YAxis tick={{ fontSize: 11, fill: '#84899e' }} />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ direction: 'rtl', textAlign: 'right', borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.3)' }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="income" name="الدخل" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="expense" name="المصروف" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="cumulative" name="الرصيد التراكمي" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

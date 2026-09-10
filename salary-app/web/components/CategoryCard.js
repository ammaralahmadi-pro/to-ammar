import Link from 'next/link';
import { formatCurrency } from '../lib/format';

const STATUS_STYLES = {
  ok: { bar: 'bg-success', text: 'text-success' },
  warning: { bar: 'bg-warning', text: 'text-warning' },
  over: { bar: 'bg-danger', text: 'text-danger' },
};

export default function CategoryCard({ category }) {
  const style = STATUS_STYLES[category.status] || STATUS_STYLES.ok;
  const percent = Math.min(category.percentUsed * 100, 100);

  return (
    <Link
      href={`/categories/${category.id}`}
      className="block bg-surface shadow-card rounded-xl p-4 hover:ring-2 hover:ring-primary/20 transition"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-800">{category.name}</span>
        {category.status === 'over' && (
          <span className="text-xs font-bold text-danger bg-danger/10 px-2 py-0.5 rounded-full">تجاوز الحد</span>
        )}
        {category.status === 'warning' && (
          <span className="text-xs font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-full">اقتراب من الحد</span>
        )}
      </div>

      <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
        <div className={`h-full ${style.bar}`} style={{ width: `${percent}%` }} />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className={`font-medium ${style.text}`}>{formatCurrency(category.spent)}</span>
        <span className="text-gray-400">من {formatCurrency(category.planned)}</span>
      </div>
    </Link>
  );
}

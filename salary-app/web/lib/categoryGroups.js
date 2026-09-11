export const CATEGORY_GROUPS = [
  { key: 'debts', label: 'الالتزامات والديون', hint: 'يجب الوصول للهدف' },
  { key: 'bills', label: 'الفواتير الثابتة', hint: 'يجب الوصول للهدف' },
  { key: 'variable', label: 'المصاريف المتغيرة', hint: 'الأقل أفضل' },
  { key: 'savings', label: 'الادخار والأهداف المالية', hint: 'الأعلى أفضل' },
];

export function groupLabel(key) {
  return CATEGORY_GROUPS.find((g) => g.key === key)?.label || 'المصاريف المتغيرة';
}

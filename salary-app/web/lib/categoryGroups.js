export const CATEGORY_GROUPS = [
  { key: 'debts', label: 'الالتزامات والديون', hint: 'يجب الوصول للهدف', polarity: 'lowerBetter' },
  { key: 'bills', label: 'الفواتير الثابتة', hint: 'يجب الوصول للهدف', polarity: 'lowerBetter' },
  { key: 'variable', label: 'المصاريف المتغيرة', hint: 'الأقل أفضل', polarity: 'lowerBetter' },
  { key: 'savings', label: 'الادخار والأهداف المالية', hint: 'الأعلى أفضل', polarity: 'higherBetter' },
];

export function groupLabel(key) {
  return CATEGORY_GROUPS.find((g) => g.key === key)?.label || 'المصاريف المتغيرة';
}

export function formatCurrency(amount) {
  const value = Number.isFinite(amount) ? amount : 0;
  return `${value.toLocaleString('ar-SA', { maximumFractionDigits: 0 })} ر.س`;
}

export const MONTH_NAMES = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

export function monthLabel(year, month) {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '../lib/api';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'الرئيسية' },
  { href: '/setup', label: 'الراتب والفئات' },
];

export default function Shell({ children, onAddExpense }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await api.logout().catch(() => {});
    router.replace('/login');
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
          <span className="font-display font-extrabold text-primary text-lg whitespace-nowrap">
            توزيع الراتب
          </span>

          <nav className="flex items-center gap-1 bg-surface2 rounded-full p-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-primary text-white shadow-glow'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {onAddExpense && (
              <button
                onClick={onAddExpense}
                className="bg-primary hover:bg-primarydark hover:shadow-glow text-white text-sm font-semibold px-4 py-2 rounded-full transition"
              >
                + إضافة مصروف
              </button>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-danger px-2 py-2"
            >
              خروج
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4 md:p-8">{children}</main>
    </div>
  );
}

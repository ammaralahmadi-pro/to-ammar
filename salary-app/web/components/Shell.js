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
    <div className="min-h-screen bg-muted flex flex-col md:flex-row-reverse">
      <aside className="md:w-64 bg-surface border-b md:border-b-0 md:border-s border-gray-100 flex md:flex-col">
        <div className="p-4 font-display font-extrabold text-primary text-lg flex-1 md:flex-none">
          توزيع الراتب
        </div>
        <nav className="flex md:flex-col gap-1 p-2 md:p-4 md:pt-0 flex-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                pathname === item.href
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-muted'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-2 md:p-4 flex items-center gap-2">
          {onAddExpense && (
            <button
              onClick={onAddExpense}
              className="hidden md:block flex-1 bg-primary hover:bg-primarydark text-white text-sm font-semibold py-2 rounded-lg transition"
            >
              + إضافة مصروف
            </button>
          )}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-danger px-2"
          >
            خروج
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}

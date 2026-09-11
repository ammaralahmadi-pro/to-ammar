'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'الرئيسية' },
  { href: '/setup', label: 'الراتب والفئات' },
  { href: '/plan', label: 'الخطة' },
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
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    active ? 'text-white' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 bg-primary rounded-full shadow-glow -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {onAddExpense && (
              <motion.button
                onClick={onAddExpense}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="bg-primary hover:bg-primarydark hover:shadow-glow text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
              >
                + إضافة مصروف
              </motion.button>
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

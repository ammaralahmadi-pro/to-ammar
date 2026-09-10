'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.login({ email, password });
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message === 'request_failed_401' ? 'بيانات الدخول غير صحيحة' : 'تعذّر تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm bg-surface shadow-card rounded-2xl p-8">
        <h1 className="font-display font-extrabold text-2xl text-primary mb-1">توزيع الراتب</h1>
        <p className="text-gray-500 text-sm mb-6">سجّل الدخول لمتابعة ميزانيتك الشهرية</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          {error && <p className="text-danger text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primarydark text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'جارِ الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          ليس لديك حساب؟{' '}
          <Link href="/register" className="text-primary font-semibold">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </div>
  );
}

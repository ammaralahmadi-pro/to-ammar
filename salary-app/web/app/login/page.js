'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';

const ERROR_MESSAGES = {
  not_allowed: 'هذا البريد غير مصرّح له بالدخول إلى هذا التطبيق.',
  auth_failed: 'تعذّر تسجيل الدخول عبر Google، حاول مرة أخرى.',
  server_error: 'حدث خطأ في الخادم، حاول مرة أخرى.',
};

function LoginContent() {
  const params = useSearchParams();
  const error = params.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm bg-surface shadow-card rounded-2xl p-8 text-center">
        <h1 className="font-display font-extrabold text-2xl text-primary mb-1">توزيع الراتب</h1>
        <p className="text-gray-500 text-sm mb-8">سجّل الدخول لمتابعة ميزانيتك الشهرية</p>

        {error && (
          <p className="text-danger text-sm bg-danger/10 rounded-lg px-3 py-2 mb-6">
            {ERROR_MESSAGES[error] || 'حدث خطأ غير متوقع.'}
          </p>
        )}

        <a
          href={api.loginUrl()}
          className="flex items-center justify-center gap-3 w-full border border-gray-200 hover:bg-muted text-gray-700 font-semibold py-3 rounded-lg transition"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.3 5.1 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.3 5.1 29.4 3 24 3 16 3 9.1 7.6 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 45c5.3 0 10.1-2 13.7-5.3l-6.3-5.3C29.4 36.4 26.8 37 24 37c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9 41.4 15.9 45 24 45z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.3 5.3C40.4 36.2 44 30.6 44 24c0-1.4-.1-2.7-.4-3.5z" />
          </svg>
          تسجيل الدخول عبر Google
        </a>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

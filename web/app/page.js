'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { api } from '../lib/api';

const ERROR_MESSAGES = {
  auth_failed: 'تعذّرت عملية تسجيل الدخول عبر Google. حاول مرة أخرى.',
  not_allowed: 'هذا البريد الإلكتروني غير مصرّح له بالدخول إلى هذا التقويم العائلي.',
  missing_refresh_token: 'نحتاج موافقتك الكاملة على الصلاحيات — أعد المحاولة واضغط "متابعة" في شاشة جوجل.',
  server_error: 'حدث خطأ غير متوقع في الخادم. حاول لاحقًا.',
};

function LoginContent() {
  const params = useSearchParams();
  const error = params.get('error');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-apricot flex items-center justify-center shadow-card mb-5">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="16" rx="3" stroke="#fff" strokeWidth="1.6" />
              <path d="M3 9.5H21" stroke="#fff" strokeWidth="1.6" />
              <path d="M7.5 3V6.5M16.5 3V6.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="8" cy="13.5" r="1.1" fill="#fff" />
              <circle cx="12" cy="13.5" r="1.1" fill="#fff" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">مواعيدنا</h1>
          <p className="mt-3 text-black/60 leading-relaxed">
            تقويم عائلي واحد، يتزامن مباشرة مع تقويم Google الخاص بكل واحد منكما.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-glaze border border-warmyellow/40 px-4 py-3 text-sm text-black/80">
            {ERROR_MESSAGES[error] || 'حدث خطأ غير متوقع.'}
          </div>
        )}

        <a
          href={api.loginUrl()}
          className="flex items-center justify-center gap-3 w-full rounded-xl bg-apricot text-white font-bold py-3.5 shadow-card transition hover:brightness-95 active:scale-[.98]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z" opacity=".95" />
            <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23z" opacity=".8" />
            <path fill="#fff" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.05H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.95l3.66-2.85z" opacity=".65" />
            <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.85C6.71 7.3 9.14 5.38 12 5.38z" opacity=".9" />
          </svg>
          تسجيل الدخول بحساب Google
        </a>

        <p className="mt-5 text-center text-xs text-black/40 leading-relaxed">
          الدخول متاح فقط للبريدين الإلكترونيين المسجَّلين لهذه العائلة.
          <br />نطلب صلاحية القراءة والكتابة على تقويمك في Google Calendar فقط.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

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
    <main dir="rtl" className="min-h-screen flex flex-col bg-[#161b3f]">
      {/* ===== القسم العلوي: خلفية داكنة مع رسمة توضيحية ===== */}
      <div className="relative flex-1 min-h-[300px] flex items-center justify-center overflow-hidden">
        {/* نجوم زخرفية */}
        <span className="absolute top-[18%] left-[20%] w-1.5 h-1.5 rounded-full bg-white/50" />
        <span className="absolute top-[30%] left-[70%] w-1 h-1 rounded-full bg-white/40" />
        <span className="absolute top-[60%] left-[15%] w-1 h-1 rounded-full bg-white/40" />
        <span className="absolute top-[15%] left-[55%] w-1.5 h-1.5 rounded-full bg-white/30" />
        <span className="absolute top-[70%] left-[78%] w-1.5 h-1.5 rounded-full bg-white/40" />

        {/* توهّج خلفي */}
        <div className="absolute w-64 h-64 rounded-full bg-apricot/25 blur-3xl" />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/login-illustration.png" alt="" className="relative w-64 sm:w-72 h-auto" />
      </div>

      {/* ===== القسم السفلي: بطاقة داكنة ===== */}
      <div className="relative bg-[#20265a] rounded-t-[32px] px-6 pt-9 pb-9 flex flex-col items-center text-center shadow-[0_-20px_40px_-20px_rgba(0,0,0,.45)]">
        <h1 className="text-2xl font-extrabold text-white leading-snug">
          لنبدأ رحلتكما<br />معًا
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-white/50 max-w-xs">
          تقويم عائلي واحد يتزامن مباشرة مع Google Calendar — أي موعد تضيفه يظهر عند الطرف الثاني فورًا.
        </p>

        {error && (
          <div className="mt-5 w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-sm text-white/80">
            {ERROR_MESSAGES[error] || 'حدث خطأ غير متوقع.'}
          </div>
        )}

        <a
          href={api.loginUrl()}
          className="mt-7 flex items-center justify-center gap-2.5 w-full max-w-xs rounded-full bg-[#ff6b57] text-white font-extrabold py-4 shadow-[0_16px_28px_-12px_rgba(255,107,87,.55)] transition hover:brightness-95 active:scale-[.98]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z" opacity=".95" />
            <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23z" opacity=".8" />
            <path fill="#fff" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.05H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.95l3.66-2.85z" opacity=".65" />
            <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.85C6.71 7.3 9.14 5.38 12 5.38z" opacity=".9" />
          </svg>
          تسجيل الدخول بحساب Google
        </a>

        <p className="mt-5 text-[11px] leading-relaxed text-white/30 max-w-xs">
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

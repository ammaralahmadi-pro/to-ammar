'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { api } from '../../../lib/api';

function CallbackContent() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      router.replace('/?error=auth_failed');
      return;
    }
    api.setToken(token);
    router.replace('/dashboard');
  }, [params, router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-black/40 text-sm">جارٍ تسجيل الدخول…</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackContent />
    </Suspense>
  );
}

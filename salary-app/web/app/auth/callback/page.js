'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';

function CallbackContent() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      router.replace('/login?error=auth_failed');
      return;
    }
    api.setToken(token);
    router.replace('/dashboard');
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      جارِ تسجيل الدخول...
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackContent />
    </Suspense>
  );
}

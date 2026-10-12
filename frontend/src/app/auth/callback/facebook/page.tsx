'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../../lib/auth-context';
import { apiRequest } from '../../../../lib/api';

export default function FacebookCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'ERROR'>('LOADING');
  const [errorMessage, setErrorMessage] = useState('');

  const code = searchParams.get('code');
  const errorParam = searchParams.get('error') || searchParams.get('error_message');

  useEffect(() => {
    if (errorParam) {
      setStatus('ERROR');
      setErrorMessage(`تم إلغاء تسجيل الدخول عبر Facebook: ${errorParam}`);
      return;
    }

    if (!code) {
      setStatus('ERROR');
      setErrorMessage('لم يتم استلام رمز التحقق (Authorization Code) من خوادم Facebook.');
      return;
    }

    const exchangeCode = async () => {
      try {
        const res = await apiRequest<{
          success: boolean;
          message: string;
          data: {
            user: any;
            accessToken: string;
            refreshToken: string;
          };
        }>('/auth/facebook', {
          method: 'POST',
          body: JSON.stringify({ code }),
        });

        if (res.success && res.data) {
          setStatus('SUCCESS');
          login(res.data.accessToken, res.data.refreshToken, res.data.user);
          setTimeout(() => {
            router.push('/');
          }, 1500);
        } else {
          setStatus('ERROR');
          setErrorMessage(res.message || 'فشل التحقق من جلسة Facebook');
        }
      } catch (err: any) {
        setStatus('ERROR');
        setErrorMessage(err.message || 'حدث خطأ أثناء معالجة تسجيل دخول Facebook');
      }
    };

    exchangeCode();
  }, [code, errorParam, login, router]);

  return (
    <div className="max-w-md mx-auto my-20 px-4">
      <div className="p-8 bg-white rounded-3xl border border-gold-200/60 shadow-luxury text-center space-y-4">
        {status === 'LOADING' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-[#1877F2] text-white shadow-sm flex items-center justify-center mx-auto">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-emerald-950">جاري تسجيل الدخول بحساب Facebook...</h2>
            <p className="text-xs text-gray-500">يرجى الانتظار، جاري التحقق من بياناتك من خوادم Facebook الرسمية</p>
          </>
        )}

        {status === 'SUCCESS' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-emerald-950">تم تسجيل الدخول بنجاح!</h2>
            <p className="text-xs text-gray-500">مرحباً بك في قصر العطور، جاري تحويلك للصفحة الرئيسية...</p>
          </>
        )}

        {status === 'ERROR' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-400 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">تعذر استكمال الدخول</h2>
            <p className="text-xs text-red-600 leading-relaxed">{errorMessage}</p>
            <a
              href="/auth/login"
              className="inline-block mt-4 px-6 py-2.5 rounded-full bg-emerald-900 text-gold-400 text-xs font-bold shadow-md hover:bg-emerald-950 transition-colors"
            >
              العودة لصفحة تسجيل الدخول
            </a>
          </>
        )}
      </div>
    </div>
  );
}


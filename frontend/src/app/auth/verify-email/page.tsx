'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft, ShieldCheck, Mail } from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import { apiRequest } from '../../../lib/api';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'ERROR'>('LOADING');
  const [message, setMessage] = useState('جاري التحقق من رابط تأكيد الحساب...');

  useEffect(() => {
    if (!token && !email) {
      setStatus('ERROR');
      setMessage('رابط التأكيد غير صالح أو يفتقد لمعرف الحساب.');
      return;
    }

    const verify = async () => {
      try {
        const res = await apiRequest<{
          success: boolean;
          message: string;
          data: {
            user: any;
            accessToken: string;
            refreshToken: string;
          };
        }>('/auth/verify-email', {
          method: 'POST',
          body: JSON.stringify({ token, email }),
        });

        if (res.success && res.data) {
          setStatus('SUCCESS');
          setMessage(res.message || 'تم تأكيد بريدك الإلكتروني بنجاح!');
          login(res.data.accessToken, res.data.refreshToken, res.data.user);

          // Auto redirect after 3 seconds
          setTimeout(() => {
            router.push('/');
          }, 3000);
        } else {
          setStatus('ERROR');
          setMessage(res.message || 'فشل تأكيد الحساب، قد يكون الرابط منتهي الصلاحية.');
        }
      } catch (err: any) {
        setStatus('ERROR');
        setMessage(err.message || 'حدث خطأ أثناء تأكيد الحساب. يرجى المحاولة لاحقاً.');
      }
    };

    verify();
  }, [token, email, login, router]);

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="bg-white p-8 rounded-3xl border border-gold-200/60 shadow-luxury text-center space-y-6">
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-md">
          {status === 'LOADING' && (
            <div className="w-16 h-16 rounded-full bg-gold-50 border border-gold-400 flex items-center justify-center text-gold-600">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}
          {status === 'SUCCESS' && (
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-500 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-9 h-9" />
            </div>
          )}
          {status === 'ERROR' && (
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-500 flex items-center justify-center text-red-600">
              <AlertCircle className="w-9 h-9" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-emerald-950">
            {status === 'LOADING' && 'تأكيد البريد الإلكتروني'}
            {status === 'SUCCESS' && 'تم تفعيل الحساب بنجاح!'}
            {status === 'ERROR' && 'تعذر تأكيد الحساب'}
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>

        {status === 'SUCCESS' && (
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>أصبح حسابك موثقاً بالكامل، سيتم توجيهك لصفحة المتجر خلال 3 ثوانٍ...</span>
            </div>

            <Link
              href="/"
              className="w-full py-3.5 rounded-full bg-emerald-900 hover:bg-emerald-950 text-gold-400 font-bold text-sm transition-colors shadow-luxury flex items-center justify-center gap-2"
            >
              <span>الانتقال للمتجر الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status === 'ERROR' && (
          <div className="space-y-4 pt-2">
            <Link
              href="/auth/register"
              className="w-full py-3.5 rounded-full bg-emerald-900 hover:bg-emerald-950 text-gold-400 font-bold text-sm transition-colors shadow-luxury flex items-center justify-center gap-2"
            >
              <span>العودة لإنشاء الحساب</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <Link
                href="/auth/login"
                className="text-xs font-bold text-gold-700 hover:text-emerald-950 transition-colors"
              >
                أو تسجيل الدخول مباشرة
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Phone, ArrowLeft, AlertCircle, CheckCircle2, ShieldCheck, MessageSquare, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import { apiRequest } from '../../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // OTP Verification state if unverified account tries to login
  const [needsVerification, setNeedsVerification] = useState(false);
  const [unverifiedUserId, setUnverifiedUserId] = useState('');
  const [destination, setDestination] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpChannel, setOtpChannel] = useState<'SMS' | 'WHATSAPP'>('SMS');
  const [simulatedCode, setSimulatedCode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني/الهاتف وكلمة المرور.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await apiRequest<{
        success: boolean;
        message: string;
        requiresVerification?: boolean;
        data: any;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      if (res.requiresVerification && res.data) {
        setNeedsVerification(true);
        setUnverifiedUserId(res.data.userId);
        setDestination(res.data.destination);
        return;
      }

      if (res.success && res.data?.accessToken) {
        login(res.data.accessToken, res.data.refreshToken, res.data.user);
        router.push(redirectUrl);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'بيانات الدخول غير صحيحة.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (!otpCode || otpCode.length !== 6) {
      setOtpError('رمز التحقق يجب أن يتكون من 6 أرقام');
      return;
    }

    try {
      setIsLoading(true);
      const res = await apiRequest<{
        success: boolean;
        data: any;
      }>('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({
          userId: unverifiedUserId,
          destination,
          code: otpCode,
        }),
      });

      if (res.success && res.data?.accessToken) {
        login(res.data.accessToken, res.data.refreshToken, res.data.user);
        router.push(redirectUrl);
      }
    } catch (err: any) {
      setOtpError(err.message || 'رمز التحقق غير صحيح');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async (channel: 'SMS' | 'WHATSAPP') => {
    try {
      setOtpChannel(channel);
      setIsLoading(true);
      const res = await apiRequest<{
        success: boolean;
        message: string;
        data?: { simulatedOtp: string };
      }>('/auth/otp/resend', {
        method: 'POST',
        body: JSON.stringify({ destination, channel }),
      });

      if (res.success) {
        setSimulatedCode(res.data?.simulatedOtp || '123456');
        alert(res.message);
      }
    } catch (err: any) {
      setOtpError(err.message || 'فشل إعادة إرسال الرمز');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      'dummy-qasralotoor.apps.googleusercontent.com';
    const redirectUri = `${window.location.origin}/auth/callback/google`;
    const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=openid%20email%20profile&prompt=select_account`;
    window.location.href = googleUrl;
  };

  const handleFacebookSignIn = () => {
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '123456789012345';
    const redirectUri = `${window.location.origin}/auth/callback/facebook`;
    const fbUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=email,public_profile&response_type=code`;
    window.location.href = fbUrl;
  };

  const handleQuickDemoCustomerLogin = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest<{
        success: boolean;
        message: string;
        data: { user: any; accessToken: string; refreshToken: string };
      }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          email: 'demo.customer@qasralotoor.com',
          fullName: 'عميل تجريبي (Demo)',
          googleId: `demo_${Date.now()}`,
        }),
      });
      if (res.success && res.data) {
        login(res.data.accessToken, res.data.refreshToken, res.data.user);
        router.push(redirectUrl);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل تسجيل الدخول التجريبي');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-14 px-4 sm:px-6">
      <div className="bg-white p-8 rounded-3xl border border-gold-200/60 shadow-luxury space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-900 border border-gold-500 text-gold-400 font-bold text-xl flex items-center justify-center mx-auto shadow-md">
            ق
          </div>
          <h1 className="text-2xl font-black text-emerald-950">
            {needsVerification ? 'تأكيد الحساب برمز التحقق' : 'تسجيل الدخول'}
          </h1>
          <p className="text-xs text-gray-500">
            {needsVerification
              ? `تم إرسال رمز التحقق المكون من 6 أرقام إلى: ${destination}`
              : 'مرحباً بك مجدداً في قصر العطور الملكي'}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {needsVerification ? (
          /* OTP Verification Form */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {simulatedCode && (
              <div className="p-3 rounded-xl bg-gold-50 border border-gold-300 text-gold-900 text-xs text-center font-bold">
                💡 رمز التحقق السريع للتجربة: <span className="font-mono text-base">{simulatedCode}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block text-center">
                أدخل رمز التحقق (6 أرقام)
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full p-3 rounded-xl border-2 border-gold-400 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-gold-500"
                dir="ltr"
                autoFocus
              />
              {otpError && <span className="text-[11px] text-red-600 block text-center">{otpError}</span>}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleResendOtp('SMS')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  otpChannel === 'SMS'
                    ? 'border-emerald-800 bg-emerald-50 text-emerald-900'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال SMS</span>
              </button>
              <button
                type="button"
                onClick={() => handleResendOtp('WHATSAPP')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  otpChannel === 'WHATSAPP'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-green-600" />
                <span>إرسال واتساب</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length !== 6}
              className="w-full py-3.5 rounded-full bg-emerald-900 hover:bg-emerald-950 text-gold-400 font-bold text-sm transition-colors shadow-luxury disabled:opacity-50"
            >
              {isLoading ? 'جاري التحقق...' : 'تأكيد ودخول الحساب'}
            </button>
          </form>
        ) : (
          /* Normal Login Form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">
                البريد الإلكتروني أو رقم الهاتف *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com أو 01012345678"
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-700 block">كلمة المرور *</label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full bg-emerald-900 hover:bg-emerald-950 text-gold-400 font-bold text-sm transition-colors shadow-luxury disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'جاري الدخول...' : 'تسجيل الدخول'}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>
        )}

        {!needsVerification && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-400">أو تسجيل سريع كعميل عبر</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Google Sign-in Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="py-2.5 px-3 rounded-2xl border border-gray-300 hover:border-gold-400 hover:bg-cream-50 text-gray-700 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Google</span>
              </button>

              {/* Facebook Sign-in Button */}
              <button
                type="button"
                onClick={handleFacebookSignIn}
                disabled={isLoading}
                className="py-2.5 px-3 rounded-2xl border border-[#1877F2]/30 bg-[#1877F2]/5 hover:bg-[#1877F2]/10 text-[#1877F2] text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </button>
            </div>

            {/* One-click Demo Customer Login */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleQuickDemoCustomerLogin}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-2xl bg-gold-50 border border-gold-300 hover:bg-gold-100 text-gold-900 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-gold-700" />
                <span>دخول سريع كعميل (للتجربة الفورية بدون إعدادات خارجية)</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <span className="text-xs text-gray-500">ليس لديك حساب بعد؟ </span>
              <Link
                href={`/auth/register?redirect=${encodeURIComponent(redirectUrl)}`}
                className="text-xs font-bold text-gold-700 hover:text-emerald-950 transition-colors"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

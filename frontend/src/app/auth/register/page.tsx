'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  UserPlus,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Mail,
  Phone,
  MessageSquare,
  Send,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import { apiRequest } from '../../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const { login } = useAuth();

  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [preferredMethod, setPreferredMethod] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [phoneChannel, setPhoneChannel] = useState<'SMS' | 'WHATSAPP'>('WHATSAPP');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Post-Registration Verification State
  const [step, setStep] = useState<'REGISTER' | 'EMAIL_SENT' | 'PHONE_OTP'>('REGISTER');
  const [userId, setUserId] = useState('');
  const [destination, setDestination] = useState('');
  const [verificationLink, setVerificationLink] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendCount, setResendCount] = useState(0);


  // 5-minute Countdown timer for Phone OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'PHONE_OTP' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('الاسم يجب أن يحتوي على حرفين على الأقل.');
      return;
    }

    if (preferredMethod === 'EMAIL' && !email.trim()) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني لتأكيد الحساب عبر الرابط.');
      return;
    }

    if (preferredMethod === 'PHONE') {
      if (!phone.trim()) {
        setErrorMessage('يرجى إدخال رقم الهاتف للتأكيد عبر رسالة SMS أو واتساب.');
        return;
      }
      const egyptianPhoneRegex = /^01[0125][0-9]{8}$/;
      const cleanPhone = phone.replace(/[\s-]/g, '');
      if (!egyptianPhoneRegex.test(cleanPhone)) {
        setErrorMessage('رقم الهاتف يجب أن يكون رقماً مصرياً صحيحاً (مثال: 01012345678)');
        return;
      }
    }

    if (password.length < 6) {
      setErrorMessage('كلمة المرور يجب أن لا تقل عن 6 أحرف.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiRequest<{
        success: boolean;
        message: string;
        data: {
          userId: string;
          verificationType: 'EMAIL' | 'PHONE';
          channel: 'SMS' | 'WHATSAPP';
          destination: string;
          verificationLink?: string;
          simulatedOtp?: string;
          whatsappText?: string;
        };
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() ? phone.replace(/[\s-]/g, '') : undefined,
          password,
          verificationType: preferredMethod,
          channel: phoneChannel,
        }),
      });

      if (res.success && res.data) {
        setUserId(res.data.userId);
        setDestination(res.data.destination);

        if (res.data.verificationType === 'EMAIL') {
          setVerificationLink(res.data.verificationLink || '');
          setStep('EMAIL_SENT');
        } else {
          setSimulatedOtp(res.data.simulatedOtp || '123456');
          setStep('PHONE_OTP');
          setCountdown(300);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل إنشاء الحساب، يرجى المحاولة لاحقاً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (otpCode.length !== 6) {
      setOtpError('رمز التحقق يتكون من 6 أرقام');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiRequest<{
        success: boolean;
        message: string;
        data: any;
      }>('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          destination,
          code: otpCode,
        }),
      });

      if (res.success && res.data?.accessToken) {
        login(res.data.accessToken, res.data.refreshToken, res.data.user);
        router.push(redirectUrl);
      }
    } catch (err: any) {
      setOtpError(err.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async (channel: 'SMS' | 'WHATSAPP') => {
    if (resendCount >= 5) {
      setOtpError('تم تجاوز الحد الأقصى لإعادة الإرسال.');
      return;
    }

    try {
      setPhoneChannel(channel);
      setIsSubmitting(true);
      const res = await apiRequest<{
        success: boolean;
        message: string;
        data?: { simulatedOtp: string };
      }>('/auth/otp/resend', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          destination,
          channel,
        }),
      });

      if (res.success) {
        setCountdown(300);
        setCanResend(false);
        setResendCount((prev) => prev + 1);
        setOtpError('');
        if (res.data?.simulatedOtp) {
          setSimulatedOtp(res.data.simulatedOtp);
        }
        alert(res.message);
      }
    } catch (err: any) {
      setOtpError(err.message || 'فشل إعادة إرسال الرمز.');
    } finally {
      setIsSubmitting(false);
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

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-md mx-auto my-14 px-4 sm:px-6">
      <div className="bg-white p-8 rounded-3xl border border-gold-200/60 shadow-luxury space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-900 border border-gold-500 text-gold-400 font-bold text-xl flex items-center justify-center mx-auto shadow-md">
            ق
          </div>
          <h1 className="text-2xl font-black text-emerald-950">
            {step === 'REGISTER' && 'إنشاء حساب جديد'}
            {step === 'EMAIL_SENT' && 'تأكيد البريد الإلكتروني'}
            {step === 'PHONE_OTP' && 'رمز التحقق (OTP)'}
          </h1>
          <p className="text-xs text-gray-500">
            {step === 'REGISTER' && 'انضم لعائلة قصر العطور واستمتع بأرقى العطور الملكية'}
            {step === 'EMAIL_SENT' && `تم إرسال رابط تأكيد التفعيل إلى: ${destination}`}
            {step === 'PHONE_OTP' && `أدخل الرمز المكون من 6 أرقام المرسل إلى: ${destination}`}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === 'REGISTER' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">الاسم بالكامل *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="محمد إبراهيم"
                className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            {/* Preferred Verification Method Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-gray-700 block">طريقة تأكيد الحساب المفضلة:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPreferredMethod('EMAIL')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    preferredMethod === 'EMAIL'
                      ? 'border-emerald-800 bg-emerald-50 text-emerald-900 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Mail className="w-4 h-4 text-gold-600" />
                  <span>رابط بالبريد</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreferredMethod('PHONE')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    preferredMethod === 'PHONE'
                      ? 'border-emerald-800 bg-emerald-50 text-emerald-900 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Phone className="w-4 h-4 text-gold-600" />
                  <span>رسالة على الهاتف</span>
                </button>
              </div>
            </div>

            {/* Phone Channel (SMS or WhatsApp) if Phone selected */}
            {preferredMethod === 'PHONE' && (
              <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200/60 space-y-2 animate-in fade-in">
                <label className="text-[11px] font-bold text-emerald-950 block">
                  قناة استلام رمز التحقق على هاتفك:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPhoneChannel('WHATSAPP')}
                    className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      phoneChannel === 'WHATSAPP'
                        ? 'border-green-600 bg-green-600 text-white shadow-sm'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>رسالة واتساب</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhoneChannel('SMS')}
                    className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      phoneChannel === 'SMS'
                        ? 'border-emerald-900 bg-emerald-900 text-gold-400 shadow-sm'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>رسالة SMS</span>
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">
                {preferredMethod === 'EMAIL' ? 'البريد الإلكتروني *' : 'البريد الإلكتروني (اختياري)'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 text-left"
                dir="ltr"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">
                {preferredMethod === 'PHONE' ? 'رقم الهاتف المحمول (مصر) *' : 'رقم الهاتف المحمول (اختياري)'}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01012345678"
                className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 text-left font-mono"
                dir="ltr"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">كلمة المرور *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (6 أحرف على الأقل)"
                className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full bg-emerald-900 hover:bg-emerald-950 text-gold-400 font-bold text-sm transition-colors shadow-luxury disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>
                {isSubmitting
                  ? 'جاري إرسال الطلب...'
                  : preferredMethod === 'EMAIL'
                  ? 'إرسال رابط تأكيد البريد'
                  : `إرسال الرمز عبر ${phoneChannel === 'WHATSAPP' ? 'واتساب' : 'SMS'}`}
              </span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-400">أو تسجيل فوري كعميل عبر</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
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

              {/* Facebook Button */}
              <button
                type="button"
                onClick={handleFacebookSignIn}
                disabled={isSubmitting}
                className="py-2.5 px-3 rounded-2xl border border-[#1877F2]/30 bg-[#1877F2]/5 hover:bg-[#1877F2]/10 text-[#1877F2] text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <span className="text-xs text-gray-500">لديك حساب بالفعل؟ </span>
              <Link
                href={`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`}
                className="text-xs font-bold text-gold-700 hover:text-emerald-950 transition-colors"
              >
                تسجيل الدخول
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2A: Email Verification Link Sent */}
        {step === 'EMAIL_SENT' && (
          <div className="space-y-5 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-400 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <Mail className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-emerald-950">تفقد بريدك الإلكتروني</h2>
              <p className="text-xs text-gray-600 leading-relaxed">
                أرسلنا رابط التفعيل إلى{' '}
                <span className="font-bold text-emerald-900" dir="ltr">
                  {destination}
                </span>
                . يرجى الضغط على الرابط في رسالتك لتفعيل حسابك والبدء في التسوق.
              </p>
            </div>

            <div className="p-4 bg-gold-50/80 rounded-2xl border border-gold-300 text-right space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gold-900">
                <Sparkles className="w-4 h-4 text-gold-700 shrink-0" />
                <span>رابط تفعيل الحساب الفوري (للتجربة المحلية):</span>
              </div>
              <p className="text-[11px] text-gray-600 break-all font-mono bg-white p-2.5 rounded-xl border border-gold-200" dir="ltr">
                {verificationLink}
              </p>
              <Link
                href={verificationLink}
                className="w-full py-3 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-gold-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <span>تفعيل الحساب فوراً بنقرة واحدة</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setStep('REGISTER')}
                className="text-xs text-gray-500 hover:text-emerald-950 underline"
              >
                العودة لتعديل البيانات
              </button>
            </div>
          </div>
        )}

        {/* STEP 2B: Phone OTP Form */}
        {step === 'PHONE_OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
            {simulatedOtp && (
              <div className="p-3.5 rounded-2xl bg-gold-50 border border-gold-300 text-gold-950 text-xs text-center space-y-1">
                <div className="font-bold">
                  {phoneChannel === 'WHATSAPP' ? '💬 كود واتساب للتجربة:' : '📱 كود SMS للتجربة:'}
                </div>
                <div className="font-mono text-xl font-black text-emerald-900">{simulatedOtp}</div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block text-center">
                أدخل رمز التأكيد (6 أرقام)
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

            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
              <span>ينتهي الرمز خلال: </span>
              <span className="font-mono font-bold text-emerald-900">
                {countdown > 0 ? formatTimer(countdown) : 'انتهت الصلاحية'}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otpCode.length !== 6}
              className="w-full py-3.5 rounded-full bg-emerald-900 hover:bg-emerald-950 text-gold-400 font-bold text-sm transition-colors shadow-luxury disabled:opacity-50"
            >
              {isSubmitting ? 'جاري التأكيد...' : 'تأكيد الحساب وإتمام التسجيل'}
            </button>

            <div className="pt-2 text-center space-y-2">
              <div className="text-[11px] text-gray-400">لم يصلك الرمز؟ اختر وسيلة إعادة الإرسال:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleResendOtp('WHATSAPP')}
                  disabled={isSubmitting || countdown > 240}
                  className="py-2 px-3 rounded-xl border border-green-600/30 bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>إرسال واتساب</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleResendOtp('SMS')}
                  disabled={isSubmitting || countdown > 240}
                  className="py-2 px-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-700 text-xs font-bold hover:bg-gray-100 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال SMS</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

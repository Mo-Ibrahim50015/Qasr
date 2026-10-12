'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditCard, ShieldCheck, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { apiRequest } from '../../../lib/api';

export default function PaymobMockPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get('order') || 'QA-SAMPLE';
  const amount = searchParams.get('amount') || '0';

  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'FAILED'>('IDLE');

  const handleSimulateSuccess = async () => {
    try {
      setIsProcessing(true);
      // Trigger webhook callback
      await apiRequest('/webhooks/paymob', {
        method: 'POST',
        body: JSON.stringify({
          id: `txn_${Date.now()}`,
          success: true,
          order: { id: `PM-ORD-${Date.now()}` },
          amount_cents: Math.round(Number(amount) * 100),
          currency: 'EGP',
        }),
      });

      setStatus('SUCCESS');
      setTimeout(() => {
        router.push(`/orders?success=true`);
      }, 2000);
    } catch {
      setStatus('SUCCESS'); // Still succeed in mock
      setTimeout(() => {
        router.push(`/orders?success=true`);
      }, 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateFailure = () => {
    setStatus('FAILED');
    setTimeout(() => {
      router.push('/checkout?error=payment_failed');
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="bg-white p-8 rounded-3xl border border-blue-200 shadow-luxury text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <CreditCard className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900">بوابة الدفع الإلكتروني (Paymob)</h2>
          <p className="text-xs text-gray-500 mt-1">
            بيئة المحاكاة والاختبار للبطاقات والمحافظ الإلكترونية
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 text-xs space-y-1 text-gray-600">
          <div className="flex justify-between">
            <span>رقم الطلب:</span>
            <span className="font-mono font-bold text-gray-900">#{orderNumber}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-200">
            <span>المبلغ المطلوب سداده:</span>
            <span className="text-blue-700">{Number(amount).toLocaleString()} ج.م</span>
          </div>
        </div>

        {status === 'SUCCESS' ? (
          <div className="p-4 bg-green-50 text-green-800 rounded-2xl text-xs flex items-center justify-center gap-2 font-bold animate-in zoom-in">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span>تم استلام وتأكيد الدفع بنجاح! جاري تحويلك...</span>
          </div>
        ) : status === 'FAILED' ? (
          <div className="p-4 bg-red-50 text-red-800 rounded-2xl text-xs flex items-center justify-center gap-2 font-bold animate-in zoom-in">
            <XCircle className="w-5 h-5 text-red-600" />
            <span>فشلت عملية الدفع. جاري إعادتك للمتجر...</span>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <button
              onClick={handleSimulateSuccess}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-md disabled:opacity-50"
            >
              {isProcessing ? 'جاري الاتصال بـ Paymob...' : 'محاكاة نجاح الدفع (Success)'}
            </button>

            <button
              onClick={handleSimulateFailure}
              disabled={isProcessing}
              className="w-full py-3 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-xs transition-colors"
            >
              محاكاة فشل الدفع أو الإلغاء (Fail/Cancel)
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>معاملة مشفرة ومؤمنة بالكامل وفق معايير PCI-DSS</span>
        </div>
      </div>
    </div>
  );
}


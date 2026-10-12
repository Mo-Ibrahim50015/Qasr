'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../../lib/cart-context';
import { useAuth } from '../../lib/auth-context';
import { apiRequest } from '../../lib/api';
import { PaymentMethod } from '../../types';

// Egyptian Governorates List
const EGYPT_GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'القليوبية',
  'الشرقية',
  'الدقهلية',
  'الغربية',
  'المنوفية',
  'البحيرة',
  'كفر الشيخ',
  'دمياط',
  'بورسعيد',
  'الإسماعيلية',
  'السويس',
  'شمال سيناء',
  'جنوب سيناء',
  'البحر الأحمر',
  'الفيوم',
  'بني سويف',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'مطروح',
  'الوادي الجديد',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, fetchCart } = useCart();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [city, setCity] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [notes, setNotes] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [codSettings, setCodSettings] = useState<{ codEnabledGlobal: boolean; codMaxOrderEgp: number | null }>({
    codEnabledGlobal: true,
    codMaxOrderEgp: 10000,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      if (user.fullName) setFullName(user.fullName);
      if (user.phone) setPhone(user.phone);
    }

    // Fetch COD settings
    async function loadSettings() {
      try {
        const res = await apiRequest<{ success: boolean; data: any }>('/checkout/cod-settings');
        if (res.success && res.data) {
          setCodSettings(res.data);
        }
      } catch {
        // fallback
      }
    }
    loadSettings();
  }, [user]);

  const items = cart?.items || [];
  const orderTotal = cart?.totalEgp || 0;

  // Evaluate COD availability for current cart (PRD P0-F007 & P0-F011)
  const isCodBlockedByTotal = Boolean(
    codSettings.codMaxOrderEgp && orderTotal > codSettings.codMaxOrderEgp
  );
  const hasProductWithCodDisabled = items.some(
    (item) => item.variant?.product?.codMode === 'DISABLE'
  );
  const isCodAvailable = codSettings.codEnabledGlobal && !isCodBlockedByTotal && !hasProductWithCodDisabled;

  // If COD is blocked, switch to Paymob
  useEffect(() => {
    if (!isCodAvailable && paymentMethod === 'COD') {
      setPaymentMethod('PAYMOB');
    }
  }, [isCodAvailable, paymentMethod]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 3) {
      errors.fullName = 'الاسم بالكامل مطلوب (3 أحرف على الأقل)';
    }

    const egyptianPhoneRegex = /^01[0125][0-9]{8}$/;
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!egyptianPhoneRegex.test(cleanPhone)) {
      errors.phone = 'رقم الهاتف يجب أن يكون رقم مصري صالح (مثال: 01012345678)';
    }

    if (!city.trim()) {
      errors.city = 'المدينة / المنطقة مطلوبة';
    }

    if (!addressDetails.trim() || addressDetails.trim().length < 5) {
      errors.addressDetails = 'تفاصيل العنوان واسم الشارع والعمارة مطلوبة';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!user) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Generate unique idempotency key for this submission attempt
      const idempotencyKey = `chk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      const payload = {
        idempotencyKey,
        paymentMethod,
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.replace(/[\s-]/g, ''),
          governorate,
          city: city.trim(),
          addressDetails: addressDetails.trim(),
          notes: notes.trim() || undefined,
        },
      };

      const res = await apiRequest<{
        success: boolean;
        message: string;
        data: { order: { id: string; orderNumber: string }; paymentUrl?: string };
      }>('/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success && res.data?.order) {
        await fetchCart(); // Refresh cart to empty state

        if (paymentMethod === 'PAYMOB' && res.data.paymentUrl) {
          // Redirect to Paymob iframe/checkout
          window.location.href = res.data.paymentUrl;
        } else {
          // COD: Redirect to Order Tracking
          router.push(`/orders/${res.data.order.id}?success=true`);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل إتمام الطلب، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthLoading && !user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-gold-200 text-center space-y-4 shadow-luxury">
        <Lock className="w-12 h-12 text-gold-600 mx-auto" />
        <h2 className="text-xl font-bold text-emerald-950">تسجيل الدخول مطلوب لإتمام الشراء</h2>
        <p className="text-xs text-gray-500">
          طبقاً لمعايير أمان المتجر (PRD)، يلزم تسجيل الدخول أو تأكيد حسابك برمز التحقق لضمان تأكيد طلبك وتسليمه بنجاح.
        </p>
        <Link
          href="/auth/login?redirect=/checkout"
          className="inline-block w-full py-3 rounded-full bg-emerald-900 text-gold-400 font-bold text-sm hover:bg-emerald-950 transition-colors"
        >
          تسجيل الدخول / إنشاء حساب جديد
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-gray-100 text-center space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
        <h2 className="text-xl font-bold text-gray-800">سلة التسوق فارغة</h2>
        <p className="text-xs text-gray-500">لا يمكنك إتمام الدفع بدون وجود عطور في سلتك.</p>
        <Link
          href="/categories/all"
          className="inline-block px-6 py-2.5 rounded-full bg-gold-500 text-emerald-950 font-bold text-xs"
        >
          تصفح العطور الآن
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-emerald-950">إتمام الشراء وتأكيد الطلب</h1>
        <p className="text-xs text-gray-500 mt-1">
          أدخل بيانات الشحن واختر طريقة الدفع المناسبة لك.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Form & Payment Selection (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Form Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-emerald-950 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Truck className="w-5 h-5 text-gold-600" />
              <span>عنوان الشحن والتسليم داخل مصر</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">الاسم بالكامل *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="محمد إبراهيم"
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
                {fieldErrors.fullName && (
                  <span className="text-[11px] text-red-600">{fieldErrors.fullName}</span>
                )}
              </div>

              {/* Egyptian Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">
                  رقم الهاتف المحمول (مصر) *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 text-left font-mono"
                  dir="ltr"
                />
                {fieldErrors.phone && (
                  <span className="text-[11px] text-red-600">{fieldErrors.phone}</span>
                )}
              </div>

              {/* Governorate */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">المحافظة *</label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
                >
                  {EGYPT_GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>

              {/* City / District */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">المدينة / الحي *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="مدينة نصر / التجمع الخامس"
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
                {fieldErrors.city && (
                  <span className="text-[11px] text-red-600">{fieldErrors.city}</span>
                )}
              </div>

              {/* Detailed Address */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-700 block">
                  العنوان بالتفصيل (اسم الشارع، رقم العمارة، الشقة) *
                </label>
                <textarea
                  rows={2}
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                  placeholder="شارع عباس العقاد، عمارة 15، الدور الرابع، شقة 8"
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
                {fieldErrors.addressDetails && (
                  <span className="text-[11px] text-red-600">{fieldErrors.addressDetails}</span>
                )}
              </div>

              {/* Notes */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-700 block">
                  ملاحظات إضافية للتوصيل (اختياري)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: يرجى الاتصال قبل الوصول بنصف ساعة"
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-emerald-950 flex items-center gap-2 border-b border-gray-100 pb-3">
              <CreditCard className="w-5 h-5 text-gold-600" />
              <span>طريقة الدفع</span>
            </h3>

            <div className="space-y-4">
              {/* Option 1: Cash on Delivery (COD) */}
              <label
                className={`relative flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-gold-500 bg-gold-50/40 ring-2 ring-gold-400/20'
                    : isCodAvailable
                    ? 'border-gray-200 hover:border-gold-300 bg-white'
                    : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  disabled={!isCodAvailable}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 w-4 h-4 text-gold-600 focus:ring-gold-500"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-emerald-800" />
                      <span>الدفع عند الاستلام (COD)</span>
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      الأكثر تفضيلاً في مصر
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    ادفع نقداً لمندوب الشحن عند استلام الطرد ومعاينته في عنوانك.
                  </p>

                  {!isCodAvailable && (
                    <div className="mt-2 text-xs font-semibold text-amber-700 bg-amber-50 p-2 rounded-lg flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {!codSettings.codEnabledGlobal
                          ? 'الدفع عند الاستلام معطل مؤقتاً.'
                          : isCodBlockedByTotal
                          ? `الدفع عند الاستلام متاح للطلبات حتى ${codSettings.codMaxOrderEgp} ج.م فقط.`
                          : 'الدفع عند الاستلام غير متاح لبعض المنتجات في سلتك.'}
                      </span>
                    </div>
                  )}
                </div>
              </label>

              {/* Option 2: Online Payment (Paymob) */}
              <label
                className={`relative flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'PAYMOB'
                    ? 'border-gold-500 bg-gold-50/40 ring-2 ring-gold-400/20'
                    : 'border-gray-200 hover:border-gold-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="PAYMOB"
                  checked={paymentMethod === 'PAYMOB'}
                  onChange={() => setPaymentMethod('PAYMOB')}
                  className="mt-1 w-4 h-4 text-gold-600 focus:ring-gold-500"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gold-600" />
                      <span>دفع إلكتروني آمن (Paymob)</span>
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                      بطاقات ومحافظ إلكترونية
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    ادفع بأمان عبر بطاقة الائتمان (فيزا / ماستركارد)، كارت ميزة، أو المحافظ الإلكترونية (فودافون كاش، إنستاباي).
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar (1 Col) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 sticky top-28">
            <h3 className="font-bold text-base text-emerald-950 border-b border-gray-100 pb-3">
              ملخص الطلب ({items.length} منتجات)
            </h3>

            {/* Mini Items List */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-xs items-center">
                  <img
                    src={item.variant?.product?.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=100'}
                    alt=""
                    className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                  />
                  <div className="flex-1">
                    <h5 className="font-bold text-gray-800 line-clamp-1">
                      {item.variant?.product?.nameAr}
                    </h5>
                    <span className="text-gray-400">
                      {item.variant.sizeMl} مل × {item.quantity}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-950">
                    {(item.variant.priceEgp * item.quantity).toLocaleString()} ج.م
                  </span>
                </div>
              ))}
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-2 pt-3 border-t border-gray-100 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-semibold text-gray-800">
                  {cart?.subtotalEgp.toLocaleString()} ج.م
                </span>
              </div>

              {cart && cart.discountEgp > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>كود الخصم ({cart.appliedDiscountCode}):</span>
                  <span>-{cart.discountEgp.toLocaleString()} ج.م</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>الشحن:</span>
                <span className="font-semibold text-gray-800">
                  {cart?.shippingFeeEgp === 0 ? 'شحن مجاني' : `${cart?.shippingFeeEgp} ج.م`}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-emerald-950 pt-3 border-t border-gray-200">
                <span>المبلغ الإجمالي:</span>
                <span className="text-gold-700">{orderTotal.toLocaleString()} ج.م</span>
              </div>
            </div>

            {/* Double-click Protection CTA Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-full bg-emerald-900 hover:bg-emerald-950 text-gold-400 font-bold text-sm transition-all shadow-luxury flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'جاري تأكيد الطلب...' : 'تأكيد الطلب الآن'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>ضمان أصالة المنتج 100% وإمكانية الفحص عند الاستلام</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}


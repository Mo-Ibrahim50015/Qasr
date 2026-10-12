'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  CheckCheck,
  XCircle,
  MapPin,
  Calendar,
  CreditCard,
  Banknote,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Order, OrderStatus } from '../../../types';
import { apiRequest } from '../../../lib/api';

const STATUS_STEPS: { status: OrderStatus; labelAr: string; desc: string; icon: any }[] = [
  { status: 'CONFIRMED', labelAr: 'تم تأكيد الطلب', desc: 'تم استلام وتأكيد طلبك بنجاح', icon: CheckCircle2 },
  { status: 'PREPARING', labelAr: 'قيد التجهيز والتغليف', desc: 'يتم تجهيز وفحص العطور الملكية بعناية', icon: Package },
  { status: 'SHIPPED', labelAr: 'تم الشحن مع المندوب', desc: 'الشحنة في طريقها إلى عنوانك', icon: Truck },
  { status: 'DELIVERED', labelAr: 'تم التسليم بنجاح', desc: 'تم استلام الطلب، نتمنى لك تجربة عطرية ساحرة', icon: CheckCheck },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const isJustPlaced = searchParams.get('success') === 'true';

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadOrder() {
      try {
        setIsLoading(true);
        const res = await apiRequest<{ success: boolean; data: { order: Order } }>(
          `/orders/${id}`
        );
        if (res.success && res.data?.order) {
          setOrder(res.data.order);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'فشل استرجاع بيانات الطلب');
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded-3xl" />
      </div>
    );
  }

  if (errorMessage || !order) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-gray-100 text-center space-y-4 shadow-sm">
        <XCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-800">
          {errorMessage || 'الطلب غير موجود.'}
        </h2>
        <p className="text-xs text-gray-500">
          تأكد من رقم الطلب أو أنك مسجل بالحساب الصحيح الذي تم الطلب منه.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-full bg-emerald-900 text-gold-400 font-bold text-xs"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  // Calculate current progress index
  const statusOrderMap: Record<OrderStatus, number> = {
    PENDING_PAYMENT: 0,
    CONFIRMED: 1,
    PREPARING: 2,
    SHIPPED: 3,
    DELIVERED: 4,
    CANCELLED: -1,
  };

  const currentStep = statusOrderMap[order.status] || 1;
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Success Notification if just completed */}
      {isJustPlaced && (
        <div className="p-4 rounded-2xl bg-emerald-900 text-gold-300 border border-gold-400/40 shadow-gold flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-gold-400 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-white">تهانينا! تم تأكيد طلبك بنجاح 🎉</h4>
              <p className="text-xs text-cream-200/80">
                تم إرسال رسالة تأكيد عبر الهاتف والبريد الإلكتروني برقم الطلب.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-emerald-950 px-3 py-1 rounded-full border border-gold-500/30">
            #{order.orderNumber}
          </span>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs text-gray-400">رقم تتبع الطلب</div>
          <h1 className="text-2xl font-black text-emerald-950 font-mono">
            #{order.orderNumber}
          </h1>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              {order.paymentMethod === 'COD' ? (
                <>
                  <Banknote className="w-3.5 h-3.5 text-emerald-800" />
                  <span>دفع عند الاستلام (COD)</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-3.5 h-3.5 text-gold-600" />
                  <span>دفع إلكتروني (Paymob)</span>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-xs text-gray-400">المبلغ الإجمالي</div>
          <div className="text-2xl font-black text-gold-700">
            {order.totalEgp.toLocaleString()} ج.م
          </div>
          <span
            className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold mt-1 ${
              order.status === 'DELIVERED'
                ? 'bg-emerald-100 text-emerald-800'
                : isCancelled
                ? 'bg-red-100 text-red-800'
                : 'bg-gold-100 text-gold-900'
            }`}
          >
            {order.status === 'CONFIRMED'
              ? 'تم التأكيد'
              : order.status === 'PREPARING'
              : 'قيد التجهيز'
              : order.status === 'SHIPPED'
              ? 'في الطريق'
              : order.status === 'DELIVERED'
              ? 'تم التسليم'
              : 'تم الإلغاء'}
          </span>
        </div>
      </div>

      {/* Visual Tracking Stepper (PRD P0-F008) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="font-bold text-base text-emerald-950 border-b border-gray-100 pb-3">
          مراحل شحن وتوصيل الطلب
        </h3>

        {isCancelled ? (
          <div className="p-4 rounded-2xl bg-red-50 text-red-700 flex items-center gap-3">
            <XCircle className="w-6 h-6 shrink-0" />
            <div>
              <h5 className="font-bold text-sm">تم إلغاء هذا الطلب</h5>
              <p className="text-xs">إذا كان لديك أي استفسار يرجى التواصل مع خدمة عملاء قصر العطور.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            {STATUS_STEPS.map((step, idx) => {
              const stepIndex = idx + 1;
              const isPassed = currentStep >= stepIndex;
              const isCurrent = currentStep === stepIndex;
              const IconComponent = step.icon;

              return (
                <div
                  key={step.status}
                  className={`flex flex-col items-center text-center p-4 rounded-2xl transition-all ${
                    isCurrent
                      ? 'bg-gold-50/60 border-2 border-gold-400 shadow-sm'
                      : isPassed
                      ? 'bg-emerald-50/40 text-emerald-950'
                      : 'opacity-40'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                      isPassed
                        ? 'bg-emerald-900 text-gold-400'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-emerald-950">{step.labelAr}</h4>
                  <p className="text-[11px] text-gray-500 mt-1 leading-snug">{step.desc}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Items & Shipping Destination Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Purchased Items */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-emerald-950 border-b border-gray-100 pb-2">
            المنتجات المطلوبة ({order.items.length})
          </h4>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <div>
                  <h5 className="font-bold text-gray-800">{item.productNameSnapshot}</h5>
                  <span className="text-gray-400">
                    الكمية: {item.quantity} × {item.unitPriceEgp.toLocaleString()} ج.م
                  </span>
                </div>
                <span className="font-bold text-emerald-900">
                  {(item.unitPriceEgp * item.quantity).toLocaleString()} ج.م
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
          <h4 className="font-bold text-sm text-emerald-950 border-b border-gray-100 pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gold-600" />
            <span>بيانات التسليم ومندوب الشحن</span>
          </h4>
          <div className="text-xs text-gray-600 space-y-1.5 leading-relaxed">
            <div>
              <span className="font-bold text-gray-800">المستلم: </span>
              {order.shippingAddress?.fullName}
            </div>
            <div>
              <span className="font-bold text-gray-800">رقم الهاتف: </span>
              <span className="font-mono">{order.shippingAddress?.phone}</span>
            </div>
            <div>
              <span className="font-bold text-gray-800">المحافظة والمدينة: </span>
              {order.shippingAddress?.governorate} — {order.shippingAddress?.city}
            </div>
            <div>
              <span className="font-bold text-gray-800">العنوان بالتفصيل: </span>
              {order.shippingAddress?.addressDetails}
            </div>
            {order.shippingAddress?.notes && (
              <div>
                <span className="font-bold text-gray-800">ملاحظات: </span>
                {order.shippingAddress.notes}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PackageCheck, Calendar, CreditCard, Banknote, ChevronLeft, AlertCircle } from 'lucide-react';
import { Order } from '../../types';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

export default function CustomerOrdersPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (!user) return;
      try {
        setIsLoading(true);
        const res = await apiRequest<{ success: boolean; data: { orders: Order[] } }>('/orders');
        if (res.success && res.data?.orders) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Failed to load customer orders:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, [user]);

  if (!isAuthLoading && !user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-gray-100 text-center space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-gold-600 mx-auto" />
        <h2 className="text-xl font-bold text-gray-800">يرجى تسجيل الدخول لعرض طلباتك</h2>
        <Link
          href="/auth/login?redirect=/orders"
          className="inline-block px-6 py-2.5 rounded-full bg-emerald-900 text-gold-400 font-bold text-xs"
        >
          تسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-emerald-950">سجل طلباتي</h1>
        <p className="text-xs text-gray-500 mt-1">
          متابعة حالة شحن وتوصيل طلباتك السابقة من قصر العطور
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mx-auto text-gold-600">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">لم تقم بإجراء أي طلبات حتى الآن</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            تصفح تشكيلاتنا العطرية الفاخرة واختر ما يناسب ذوقك الراقي.
          </p>
          <Link
            href="/categories/all"
            className="inline-block px-6 py-2.5 rounded-full bg-emerald-900 text-gold-400 font-bold text-xs"
          >
            تصفح التشكيلات الآن
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white p-6 rounded-2xl border border-gray-100 hover:border-gold-300 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-emerald-950 font-mono">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gold-100 text-gold-900'
                      }`}
                    >
                      {order.status === 'CONFIRMED'
                        ? 'تم التأكيد'
                        : order.status === 'PREPARING'
                        ? 'قيد التجهيز'
                        : order.status === 'SHIPPED'
                        ? 'في الطريق'
                        : order.status === 'DELIVERED'
                        ? 'تم التسليم'
                        : 'ملغي'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                    </span>
                    <span>•</span>
                    <span>
                      {order.paymentMethod === 'COD' ? 'دفع عند الاستلام' : 'دفع إلكتروني'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-gray-400 block">الإجمالي:</span>
                    <span className="text-base font-black text-gold-700">
                      {order.totalEgp.toLocaleString()} ج.م
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center text-gray-500 group-hover:bg-gold-500 group-hover:text-emerald-950 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


'use client';

import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Banknote,
  CreditCard,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true);
        const res = await apiRequest<{ success: boolean; data: any }>('/admin/stats');
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const metrics = stats?.metrics;
  const recentOrders = stats?.recentOrders || [];

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
            <span>إجمالي المبيعات المؤكدة</span>
            <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-950">
            {metrics ? `${metrics.totalRevenueEgp.toLocaleString()} ج.م` : '...'}
          </div>
          <p className="text-[11px] text-gray-400">من الطلبات المؤكدة والمدفوعة</p>
        </div>

        {/* Confirmed Orders */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
            <span>عدد الطلبات المؤكدة</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-950">
            {metrics ? `${metrics.confirmedOrPaidOrders}` : '...'}
          </div>
          <p className="text-[11px] text-gray-400">
            هدف الإطلاق الأول: ≥ 100 طلب (المتبقي: {metrics ? Math.max(0, 100 - metrics.confirmedOrPaidOrders) : 100})
          </p>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
            <span>متوسط قيمة الطلب (AOV)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-950">
            {metrics ? `${metrics.averageOrderValueEgp.toLocaleString()} ج.م` : '...'}
          </div>
          <p className="text-[11px] text-gray-400">المستهدف: ≥ 600 ج.م</p>
        </div>

        {/* Catalog Capacity */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold">
            <span>سعة الكتالوج الحالية</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-950">
            {metrics ? `${metrics.productCount} / 1,000` : '...'}
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gold-500 h-full rounded-full"
              style={{ width: `${Math.min(100, ((metrics?.productCount || 0) / 1000) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Payment Methods Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-emerald-950 border-b border-gray-100 pb-2">
            توزيع طرق الدفع
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 text-xs font-bold">
              <span className="flex items-center gap-2 text-emerald-950">
                <Banknote className="w-4 h-4 text-emerald-700" />
                <span>الدفع عند الاستلام (COD)</span>
              </span>
              <span className="text-emerald-900">{metrics?.codOrdersCount || 0} طلبات</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 text-xs font-bold">
              <span className="flex items-center gap-2 text-blue-950">
                <CreditCard className="w-4 h-4 text-blue-700" />
                <span>الدفع الإلكتروني (Paymob)</span>
              </span>
              <span className="text-blue-900">{metrics?.paymobOrdersCount || 0} طلبات</span>
            </div>
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h4 className="font-bold text-sm text-emerald-950">أحدث الطلبات المستلمة</h4>
            <a href="/admin/orders" className="text-xs text-gold-700 font-bold hover:underline">
              عرض كافة الطلبات ←
            </a>
          </div>

          <div className="space-y-2">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">لا توجد طلبات مسجلة بعد</p>
            ) : (
              recentOrders.map((o: any) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-cream-50 text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-emerald-950 block">
                      #{o.orderNumber}
                    </span>
                    <span className="text-gray-400">{o.user?.fullName}</span>
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-gold-700 block">
                      {o.totalEgp.toLocaleString()} ج.م
                    </span>
                    <span className="text-[10px] text-gray-400">{o.paymentMethod}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


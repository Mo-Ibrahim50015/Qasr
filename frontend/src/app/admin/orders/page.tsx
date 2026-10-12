'use client';

import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  CheckCheck,
  XCircle,
  Banknote,
  CreditCard,
  ChevronLeft,
} from 'lucide-react';
import { Order, OrderStatus } from '../../../types';
import { apiRequest } from '../../../lib/api';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Selected Order for Status Update Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [targetStatus, setTargetStatus] = useState<OrderStatus>('PREPARING');
  const [statusNotes, setStatusNotes] = useState('');
  const [codCollected, setCodCollected] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      if (statusFilter) params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);

      const res = await apiRequest<{
        success: boolean;
        data: { orders: Order[]; pagination: { total: number } };
      }>(`/orders/admin/all?${params.toString()}`);

      if (res.success && res.data) {
        setOrders(res.data.orders);
        setTotalCount(res.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter]);

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setTargetStatus(
      order.status === 'CONFIRMED'
        ? 'PREPARING'
        : order.status === 'PREPARING'
        ? 'SHIPPED'
        : order.status === 'SHIPPED'
        ? 'DELIVERED'
        : 'CONFIRMED'
    );
    setStatusNotes('');
    setCodCollected(order.paymentMethod === 'COD');
    setUpdateError('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdateError('');

    try {
      setIsUpdating(true);
      const res = await apiRequest(`/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: targetStatus,
          notes: statusNotes || undefined,
          codCollected: selectedOrder.paymentMethod === 'COD' && codCollected,
        }),
      });

      if (res.success) {
        setSelectedOrder(null);
        loadOrders();
      }
    } catch (err: any) {
      setUpdateError(err.message || 'فشل تحديث حالة الطلب');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-emerald-950">إدارة ومعالجة الطلبات</h3>
          <span className="text-xs text-gray-500">
            تحميل 50 طلباً لكل صفحة مع متابعة التحصيل وتأكيد الشحن والتسليم (PRD P0-F012)
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 border rounded-xl text-xs bg-white font-semibold text-gray-700"
          >
            <option value="">جميع الحالات</option>
            <option value="CONFIRMED">مؤكد</option>
            <option value="PREPARING">قيد التجهيز</option>
            <option value="SHIPPED">تم الشحن</option>
            <option value="DELIVERED">تم التسليم</option>
            <option value="CANCELLED">ملغي</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-cream-100 text-emerald-950 font-bold border-b border-gray-200">
              <tr>
                <th className="p-4">رقم الطلب</th>
                <th className="p-4">العميل والموبايل</th>
                <th className="p-4">المحافظة</th>
                <th className="p-4">المبلغ وطريقة الدفع</th>
                <th className="p-4">حالة الطلب</th>
                <th className="p-4">تحصيل COD</th>
                <th className="p-4 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    جاري تحميل الطلبات...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    لا توجد طلبات مسجلة تطابق البحث.
                  </td>
                </tr>
              ) : (
                orders.map((o: any) => {
                  const addr = o.shippingAddress || {};
                  return (
                    <tr key={o.id} className="hover:bg-cream-50/50">
                      <td className="p-4 font-mono font-bold text-emerald-950">
                        #{o.orderNumber}
                      </td>
                      <td className="p-4">
                        <span className="font-bold block">{addr.fullName || o.user?.fullName}</span>
                        <span className="font-mono text-gray-400 text-[11px]">
                          {addr.phone || o.user?.phone}
                        </span>
                      </td>
                      <td className="p-4">{addr.governorate || '—'}</td>
                      <td className="p-4">
                        <span className="font-black text-emerald-950 block">
                          {o.totalEgp.toLocaleString()} ج.م
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {o.paymentMethod === 'COD' ? 'دفع عند الاستلام' : 'دفع إلكتروني'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            o.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gold-100 text-gold-900'
                          }`}
                        >
                          {o.status === 'CONFIRMED'
                            ? 'مؤكد'
                            : o.status === 'PREPARING'
                            ? 'قيد التجهيز'
                            : o.status === 'SHIPPED'
                            ? 'تم الشحن'
                            : o.status === 'DELIVERED'
                            ? 'تم التسليم'
                            : 'ملغي'}
                        </span>
                      </td>
                      <td className="p-4">
                        {o.paymentMethod === 'COD' ? (
                          o.codCollectedAt ? (
                            <span className="text-emerald-700 font-bold text-[10px]">
                              ✓ تم التحصيل
                            </span>
                          ) : (
                            <span className="text-amber-600 font-bold text-[10px]">
                              بانتظار التحصيل
                            </span>
                          )
                        ) : (
                          <span className="text-gray-400 text-[10px]">مدفوع إلكترونياً</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => openStatusModal(o)}
                          className="px-3 py-1 bg-emerald-900 text-gold-400 rounded-lg text-xs font-bold hover:bg-emerald-950 transition-colors shadow-sm"
                        >
                          تحديث الحالة
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Transition Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-base text-emerald-950 border-b border-gray-100 pb-3">
              تحديث حالة الطلب #{selectedOrder.orderNumber}
            </h3>

            {updateError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold">
                {updateError}
              </div>
            )}

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">الحالة الحالية للطلب:</label>
                <div className="p-2.5 bg-gray-100 rounded-xl font-bold text-emerald-950">
                  {selectedOrder.status}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">الحالة الجديدة المطلوبة *</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as OrderStatus)}
                  className="w-full p-2.5 border rounded-xl bg-white font-semibold text-gray-800"
                >
                  <option value="CONFIRMED">مؤكد (Confirmed)</option>
                  <option value="PREPARING">قيد التجهيز والتغليف (Preparing)</option>
                  <option value="SHIPPED">تم الشحن مع المندوب (Shipped)</option>
                  <option value="DELIVERED">تم التسليم للعميل (Delivered)</option>
                  <option value="CANCELLED">إلغاء الطلب (Cancelled)</option>
                </select>
              </div>

              {selectedOrder.paymentMethod === 'COD' && (
                <label className="flex items-center gap-2 p-3 rounded-xl bg-gold-50/60 border border-gold-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={codCollected}
                    onChange={(e) => setCodCollected(e.target.checked)}
                    className="rounded text-gold-600 focus:ring-gold-500"
                  />
                  <span className="font-bold text-emerald-950">
                    تأكيد تحصيل المبلغ نقداً ({selectedOrder.totalEgp.toLocaleString()} ج.م)
                  </span>
                </label>
              )}

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">
                  ملاحظات التحديث / رقم بوليصة الشحن
                </label>
                <input
                  type="text"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="مثال: تم تسليم الطرد لشركة الشحن بوليصة #987654"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 rounded-full border text-gray-600 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 rounded-full bg-emerald-900 text-gold-400 font-bold hover:bg-emerald-950 transition-colors disabled:opacity-50"
                >
                  {isUpdating ? 'جاري الحفظ...' : 'حفظ التحديث وإرسال إشعار للعميل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


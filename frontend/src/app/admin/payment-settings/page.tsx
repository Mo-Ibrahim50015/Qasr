'use client';

import React, { useEffect, useState } from 'react';
import { Sliders, Banknote, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiRequest } from '../../../lib/api';

export default function AdminPaymentSettingsPage() {
  const [codEnabledGlobal, setCodEnabledGlobal] = useState(true);
  const [codMaxOrderEgp, setCodMaxOrderEgp] = useState<number | string>(10000);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const res = await apiRequest<{ success: boolean; data: { settings: any } }>(
          '/admin/payment-settings'
        );
        if (res.success && res.data?.settings) {
          setCodEnabledGlobal(res.data.settings.codEnabledGlobal);
          setCodMaxOrderEgp(res.data.settings.codMaxOrderEgp || '');
        }
      } catch (err) {
        console.error('Failed to load payment settings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    try {
      setIsSaving(true);
      const payload = {
        codEnabledGlobal,
        codMaxOrderEgp: codMaxOrderEgp ? Number(codMaxOrderEgp) : null,
      };

      const res = await apiRequest<{ success: boolean; message: string }>('/admin/payment-settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSuccessMessage('تم حفظ إعدادات الدفع عند الاستلام بنجاح.');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center">
          <Banknote className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-base text-emerald-950">
            إعدادات الدفع عند الاستلام (COD Settings)
          </h3>
          <p className="text-xs text-gray-500">
            التحكم في تفعيل أو تعطيل خيار الدفع نقداً عند الاستلام وتحديد السقف المالي للطلبات (PRD P0-F011)
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-sm">
        {/* Global Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-cream-50/60 border border-gray-200">
          <div>
            <h4 className="font-bold text-emerald-950">تفعيل الدفع عند الاستلام عاماً بالمتجر</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              عند تعطيل هذا الخيار، سيتم حجب الدفع عند الاستلام في صفحة إتمام الطلب لجميع العملاء.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={codEnabledGlobal}
              onChange={(e) => setCodEnabledGlobal(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
          </label>
        </div>

        {/* Max Order Value in EGP */}
        <div className="space-y-2">
          <label className="font-bold text-xs text-gray-700 block">
            الحد الأقصى لقيمة الطلب بالدفع عند الاستلام (بالجنيه المصري EGP)
          </label>
          <input
            type="number"
            value={codMaxOrderEgp}
            onChange={(e) => setCodMaxOrderEgp(e.target.value)}
            placeholder="مثال: 10000"
            className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
          <p className="text-[11px] text-gray-400">
            الطلبات التي تتجاوز هذا المبلغ الإجمالي سيُطلب من العميل سدادها إلكترونياً لتقليل مخاطر الإلغاء.
          </p>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 rounded-full bg-emerald-900 hover:bg-emerald-950 text-gold-400 font-bold text-xs transition-colors shadow-luxury disabled:opacity-50"
          >
            {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </form>
    </div>
  );
}


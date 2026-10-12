'use client';

import React, { useEffect, useState } from 'react';
import { Tag, Plus, CheckCircle2, AlertCircle, X, Calendar } from 'lucide-react';
import { apiRequest } from '../../../lib/api';
import { Product } from '../../../types';

export default function AdminDiscountCodesPage() {
  const [codes, setCodes] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [value, setValue] = useState<number>(10);
  const [startsAt, setStartsAt] = useState(new Date().toISOString().slice(0, 10));
  const [endsAt, setEndsAt] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [usageLimit, setUsageLimit] = useState(100);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [codesRes, prodRes] = await Promise.all([
        apiRequest<{ success: boolean; data: { codes: any[] } }>('/admin/discount-codes'),
        apiRequest<{ success: boolean; data: { products: Product[] } }>('/products/admin/all'),
      ]);

      if (codesRes.success && codesRes.data) {
        setCodes(codesRes.data.codes);
      }
      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data.products);
      }
    } catch (err) {
      console.error('Failed to load discount codes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = () => {
    setCode(`QASR${Math.floor(10 + Math.random() * 90)}`);
    setType('PERCENT');
    setValue(10);
    setUsageLimit(100);
    setSelectedProductIds([]);
    setFormError('');
    setIsModalOpen(true);
  };

  const toggleProduct = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(selectedProductIds.filter((id) => id !== productId));
    } else {
      setSelectedProductIds([...selectedProductIds, productId]);
    }
  };

  const handleSaveCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Uppercase alphanumeric check (4-20 chars) per PRD P0-F010
    const codeRegex = /^[A-Z0-9]{4,20}$/;
    if (!codeRegex.test(code.trim().toUpperCase())) {
      setFormError('كود الخصم يجب أن يتكون من 4 إلى 20 حرفاً إنجليزياً كبيراً وأرقام فقط دون مسافات أو رموز.');
      return;
    }

    if (type === 'PERCENT' && (value < 1 || value > 100)) {
      setFormError('نسبة الخصم المئوية يجب أن تكون بين 1% و 100%.');
      return;
    }

    if (new Date(endsAt) <= new Date(startsAt)) {
      setFormError('تاريخ انتهاء الكود يجب أن يكون بعد تاريخ البدء.');
      return;
    }

    if (selectedProductIds.length === 0) {
      setFormError('يجب ربط كود الخصم بمنتج واحد على الأقل طبقاً للـ PRD.');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        code: code.trim().toUpperCase(),
        type,
        value: Number(value),
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        usageLimit: Number(usageLimit),
        active: true,
        productIds: selectedProductIds,
      };

      const res = await apiRequest<{ success: boolean; message: string }>('/admin/discount-codes', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setIsModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      setFormError(err.message || 'فشل حفظ كود الخصم');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-emerald-950">أكواد الخصم المخصصة للمنتجات</h3>
          <span className="text-xs text-gray-500">
            إنشاء أكواد ترويجية مرتبطة بمنتجات محددة مع حدود الاستخدام وتواريخ الصلاحية (PRD P0-F010)
          </span>
        </div>

        <button
          onClick={openModal}
          className="px-5 py-2.5 rounded-full bg-gold-500 hover:bg-gold-600 text-emerald-950 font-bold text-xs shadow-gold transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء كود خصم جديد</span>
        </button>
      </div>

      {/* Codes Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-right text-xs">
          <thead className="bg-cream-100 text-emerald-950 font-bold border-b border-gray-200">
            <tr>
              <th className="p-4">الكود</th>
              <th className="p-4">النوع والقيمة</th>
              <th className="p-4">المنتجات المرتبطة</th>
              <th className="p-4">مرات الاستخدام</th>
              <th className="p-4">فترة الصلاحية</th>
              <th className="p-4">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  جاري تحميل الأكواد...
                </td>
              </tr>
            ) : codes.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  لا توجد أكواد خصم مسجلة حالياً.
                </td>
              </tr>
            ) : (
              codes.map((c) => (
                <tr key={c.id} className="hover:bg-cream-50/50">
                  <td className="p-4 font-mono font-bold text-sm text-gold-700">{c.code}</td>
                  <td className="p-4 font-semibold">
                    {c.type === 'PERCENT' ? `${c.value}% خصم مئوي` : `${c.value} ج.م خصم ثابت`}
                  </td>
                  <td className="p-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {c.products?.map((pRel: any) => (
                        <span
                          key={pRel.product?.id}
                          className="px-2 py-0.5 rounded bg-gray-100 text-[10px] text-gray-800"
                        >
                          {pRel.product?.nameAr}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-emerald-950">{c.timesUsed}</span> / {c.usageLimit}
                  </td>
                  <td className="p-4 text-[11px] text-gray-500">
                    {new Date(c.startsAt).toLocaleDateString('ar-EG')} إلى{' '}
                    {new Date(c.endsAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.active && new Date() <= new Date(c.endsAt)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {c.active && new Date() <= new Date(c.endsAt) ? 'نشط' : 'منتهي الصلاحية'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Code Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-emerald-950">إنشاء كود خصم لمنتج محدد</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCode} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">
                  كود الخصم (أحرف إنجليزية كبيرة وأرقام فقط) *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="WELCOME10"
                  className="w-full p-2.5 border rounded-xl font-mono uppercase text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">نوع الخصم *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 border rounded-xl bg-white"
                  >
                    <option value="PERCENT">نسبة مئوية (%)</option>
                    <option value="FIXED">مبلغ ثابت (ج.م)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">قيمة الخصم *</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    min={1}
                    max={type === 'PERCENT' ? 100 : 10000}
                    className="w-full p-2.5 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">تاريخ البدء *</label>
                  <input
                    type="date"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full p-2.5 border rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">تاريخ الانتهاء *</label>
                  <input
                    type="date"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="w-full p-2.5 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">الحد الأقصى لعدد الاستخدامات *</label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(Number(e.target.value))}
                  min={1}
                  className="w-full p-2.5 border rounded-xl"
                  required
                />
              </div>

              {/* Product Association Multi-Select */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">
                  حدد المنتجات المؤهلة لهذا الخصم (مطلوب منتج واحد على الأقل) *
                </label>
                <div className="max-h-40 overflow-y-auto border rounded-xl p-2 space-y-1 bg-cream-50/50">
                  {products.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(p.id)}
                        onChange={() => toggleProduct(p.id)}
                        className="rounded text-gold-600 focus:ring-gold-500"
                      />
                      <span>{p.nameAr}</span>
                    </label>
                  ))}
                </div>
                <span className="text-[10px] text-gray-400 block">
                  تم اختيار {selectedProductIds.length} منتجات
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border text-gray-600 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-full bg-emerald-900 text-gold-400 font-bold hover:bg-emerald-950 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'جاري الحفظ...' : 'تفعيل الكود'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


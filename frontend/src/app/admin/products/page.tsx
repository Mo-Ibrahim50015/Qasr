'use client';

import React, { useEffect, useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Archive,
  Edit2,
  AlertCircle,
  X,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { Product, Category, Gender, ScentFamily, CodMode } from '../../../types';
import { apiRequest } from '../../../lib/api';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [sku, setSku] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [brand, setBrand] = useState('قصر العطور');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [scentNotes, setScentNotes] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [gender, setGender] = useState<Gender>('UNISEX');
  const [scentFamily, setScentFamily] = useState<ScentFamily>('ORIENTAL');
  const [codMode, setCodMode] = useState<CodMode>('INHERIT');
  const [imageUrl, setImageUrl] = useState('');
  const [variants, setVariants] = useState<
    Array<{ sizeMl: number; priceEgp: number; stockQuantity: number }>
  >([
    { sizeMl: 50, priceEgp: 1200, stockQuantity: 20 },
    { sizeMl: 100, priceEgp: 2000, stockQuantity: 30 },
  ]);

  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [prodRes, catRes] = await Promise.all([
        apiRequest<{ success: boolean; data: { products: Product[]; pagination: { total: number } } }>(
          '/products/admin/all'
        ),
        apiRequest<{ success: boolean; data: { categories: Category[] } }>('/categories/admin/all'),
      ]);

      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data.products);
        setTotalCount(prodRes.data.pagination.total);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data.categories);
        if (catRes.data.categories.length > 0 && !categoryId) {
          setCategoryId(catRes.data.categories[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load admin products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setSku(`QASR-${Math.floor(100 + Math.random() * 900)}`);
    setNameAr('');
    setNameEn('');
    setBrand('قصر العطور');
    setDescriptionAr('');
    setScentNotes('القمة: | القلب: | القاعدة:');
    setCodMode('INHERIT');
    setImageUrl('https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (totalCount >= 1000 && !editingProduct) {
      setFormError('تم الوصول للحد الأقصى لعدد المنتجات في الكتالوج (1000 منتج) طبقاً للـ PRD.');
      return;
    }

    if (!sku.trim() || !nameAr.trim() || !categoryId || !descriptionAr.trim()) {
      setFormError('يرجى ملء جميع الحقول الإلزامية.');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        sku: sku.trim(),
        nameAr: nameAr.trim(),
        nameEn: nameEn.trim() || nameAr.trim(),
        brand: brand.trim(),
        descriptionAr: descriptionAr.trim(),
        scentNotes: scentNotes.trim(),
        categoryId,
        gender,
        scentFamily,
        codMode,
        published: true,
        variants,
        images: [{ imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800', position: 1 }],
      };

      const res = await apiRequest<{ success: boolean; message: string }>('/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setIsModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      setFormError(err.message || 'فشل حفظ المنتج.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في أرشفة هذا المنتج وإخفائه من المتجر؟')) return;
    try {
      await apiRequest(`/products/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'فشل أرشفة المنتج');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-emerald-950">إدارة كتالوج المنتجات</h3>
          <span className="text-xs text-gray-500">
            السعة المستخدمة: {totalCount} من أصل 1,000 منتج كحد أقصى (PRD P0-F009)
          </span>
        </div>

        <button
          onClick={openCreateModal}
          disabled={totalCount >= 1000}
          className="px-5 py-2.5 rounded-full bg-gold-500 hover:bg-gold-600 text-emerald-950 font-bold text-xs shadow-gold transition-colors flex items-center gap-2 disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة عطر جديد</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-cream-100 text-emerald-950 font-bold border-b border-gray-200">
              <tr>
                <th className="p-4">المنتج</th>
                <th className="p-4">SKU</th>
                <th className="p-4">القسم</th>
                <th className="p-4">الأحجام والأسعار</th>
                <th className="p-4">حالة الدفع عند الاستلام</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    جاري تحميل المنتجات...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    لا توجد منتجات مسجلة. أضف عطورك الأولى الآن.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const image = p.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=100';
                  return (
                    <tr key={p.id} className="hover:bg-cream-50/50">
                      <td className="p-4 flex items-center gap-3">
                        <img src={image} alt="" className="w-10 h-10 object-cover rounded-lg border" />
                        <div>
                          <span className="font-bold text-emerald-950 block">{p.nameAr}</span>
                          <span className="text-[10px] text-gray-400">{p.nameEn}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold">{p.sku}</td>
                      <td className="p-4">{p.category?.nameAr || '—'}</td>
                      <td className="p-4">
                        {p.variants?.map((v) => (
                          <span key={v.id} className="block text-[11px]">
                            {v.sizeMl} مل: <strong>{v.priceEgp} ج.م</strong> (مخزون: {v.stockQuantity})
                          </span>
                        ))}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100">
                          {p.codMode === 'INHERIT' ? 'افتراضي المتجر' : p.codMode === 'ENABLE' ? 'مفعل' : 'معطل'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.archivedAt ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {p.archivedAt ? 'مؤرشف' : 'منشور'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleArchive(p.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                          title="أرشفة"
                        >
                          <Archive className="w-4 h-4" />
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

      {/* Add Product Modal (PRD P0-F009) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-emerald-950">إضافة عطر جديد للكتالوج</h3>
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

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">رمز المنتج (SKU) *</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    className="w-full p-2.5 border rounded-xl font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">قسم العطور (من الـ 20 قسماً) *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-white"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">اسم العطر بالعربية *</label>
                  <input
                    type="text"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="مثال: عود ملوكي فاخر"
                    className="w-full p-2.5 border rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">اسم العطر بالإنجليزية</label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="Royal Oud Malaki"
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-gray-700">الوصف التفصيلي *</label>
                  <textarea
                    rows={2}
                    value={descriptionAr}
                    onChange={(e) => setDescriptionAr(e.target.value)}
                    className="w-full p-2.5 border rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-gray-700">الهرم العطري والنوتات *</label>
                  <input
                    type="text"
                    value={scentNotes}
                    onChange={(e) => setScentNotes(e.target.value)}
                    className="w-full p-2.5 border rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">إعداد الدفع عند الاستلام (COD Mode)</label>
                  <select
                    value={codMode}
                    onChange={(e) => setCodMode(e.target.value as CodMode)}
                    className="w-full p-2.5 border rounded-xl bg-white"
                  >
                    <option value="INHERIT">تطبيق إعداد المتجر العام (مستحسن)</option>
                    <option value="ENABLE">تفعيل الدفع عند الاستلام دائماً</option>
                    <option value="DISABLE">تعطيل الدفع عند الاستلام لهذا العطر</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">رابط صورة العطر (R2 / CDN) *</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full p-2.5 border rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border text-gray-600 hover:bg-gray-50 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-full bg-emerald-900 text-gold-400 font-bold shadow-md hover:bg-emerald-950 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'جاري الحفظ...' : 'حفظ ونشر العطر'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


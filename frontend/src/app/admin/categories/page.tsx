'use client';

import React, { useEffect, useState } from 'react';
import { Layers, CheckCircle2, AlertCircle, Edit2, ExternalLink } from 'lucide-react';
import { Category } from '../../../types';
import { apiRequest } from '../../../lib/api';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest<{ success: boolean; data: { categories: Category[] } }>(
        '/categories/admin/all'
      );
      if (res.success && res.data) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-emerald-950">
            أقسام المتجر الـ 20 بالصفحة الرئيسية
          </h3>
          <span className="text-xs text-gray-500">
            إدارة ترتيب الظهور والأقسام المفعلة طبقاً للـ PRD (الهدف: 20 قسماً مخصصاً)
          </span>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-gold-100 text-gold-900 rounded-full">
          إجمالي الأقسام: {categories.length} / 20
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-right text-xs">
          <thead className="bg-cream-100 text-emerald-950 font-bold border-b border-gray-200">
            <tr>
              <th className="p-4">الترتيب</th>
              <th className="p-4">القسم</th>
              <th className="p-4">الاسم بالإنجليزية</th>
              <th className="p-4">الرابط slug</th>
              <th className="p-4">عدد المنتجات</th>
              <th className="p-4">حالة النشر</th>
              <th className="p-4 text-center">معاينة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  جاري تحميل الأقسام...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  لا توجد أقسام مسجلة. قم بتشغيل seed لإنشاء الـ 20 قسماً.
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="hover:bg-cream-50/50">
                  <td className="p-4 font-bold text-emerald-950">#{c.displayPosition}</td>
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={c.imageUrl || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=100'}
                      alt=""
                      className="w-10 h-10 object-cover rounded-lg border"
                    />
                    <span className="font-bold text-emerald-950">{c.nameAr}</span>
                  </td>
                  <td className="p-4">{c.nameEn}</td>
                  <td className="p-4 font-mono text-[11px] text-gray-500">/categories/{c.slug}</td>
                  <td className="p-4 font-bold">{c.productCount || 0}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {c.published ? 'منشور' : 'مسودة'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <a
                      href={`/categories/${c.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex p-1.5 rounded-lg text-gray-400 hover:text-emerald-900 hover:bg-gold-50"
                      title="معاينة في المتجر"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


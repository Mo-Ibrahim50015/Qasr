'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  Check,
} from 'lucide-react';
import { Product, Category, Gender, ScentFamily } from '../../../types';
import { apiRequest } from '../../../lib/api';
import { useCart } from '../../../lib/cart-context';

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { addToCart } = useCart();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('maxPrice') || '');
  const [selectedGender, setSelectedGender] = useState<string>(searchParams.get('gender') || '');
  const [selectedFamily, setSelectedFamily] = useState<string>(searchParams.get('scentFamily') || '');
  const [inStockOnly, setInStockOnly] = useState<boolean>(searchParams.get('inStock') === 'true');
  const [sortOrder, setSortOrder] = useState<string>(searchParams.get('sort') || 'newest');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const searchQuery = searchParams.get('search') || '';

  const fetchCategoryAndProducts = useCallback(async () => {
    try {
      setIsLoading(true);

      // 1. Fetch category metadata if not "all"
      if (slug !== 'all') {
        const catRes = await apiRequest<{ success: boolean; data: { category: Category } }>(
          `/categories/${slug}`
        ).catch(() => null);
        if (catRes?.success) {
          setCategory(catRes.data.category);
        }
      }

      // 2. Fetch filtered products (24 per page per PRD P0-F004)
      const queryParams = new URLSearchParams();
      if (slug !== 'all') queryParams.set('categorySlug', slug);
      if (minPrice) queryParams.set('minPrice', minPrice);
      if (maxPrice) queryParams.set('maxPrice', maxPrice);
      if (selectedGender) queryParams.set('gender', selectedGender);
      if (selectedFamily) queryParams.set('scentFamily', selectedFamily);
      if (inStockOnly) queryParams.set('inStock', 'true');
      if (sortOrder) queryParams.set('sort', sortOrder);
      if (searchQuery) queryParams.set('search', searchQuery);
      queryParams.set('page', currentPage.toString());

      const res = await apiRequest<{
        success: boolean;
        data: {
          products: Product[];
          pagination: { total: number; totalPages: number; page: number };
        };
      }>(`/products?${queryParams.toString()}`);

      if (res.success && res.data) {
        setProducts(res.data.products);
        setTotalCount(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Failed to load category products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [slug, minPrice, maxPrice, selectedGender, selectedFamily, inStockOnly, sortOrder, searchQuery, currentPage]);

  useEffect(() => {
    fetchCategoryAndProducts();
  }, [fetchCategoryAndProducts]);

  const clearAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedGender('');
    setSelectedFamily('');
    setInStockOnly(false);
    setSortOrder('newest');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    minPrice || maxPrice || selectedGender || selectedFamily || inStockOnly || searchQuery
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Category Header */}
      <div className="rounded-3xl bg-gradient-to-l from-emerald-950 to-emerald-900 text-white p-8 sm:p-12 relative overflow-hidden border border-gold-500/30 shadow-luxury">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900 border border-gold-400/40 text-gold-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{slug === 'all' ? 'الكتالوج الكامل' : 'تشكيلات قصر العطور'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            {slug === 'all'
              ? searchQuery
                ? `نتائج البحث عن: "${searchQuery}"`
                : 'جميع تشكيلات العطور (20 قسماً)'
              : category?.nameAr || 'قسم العطور'}
          </h1>
          <p className="text-sm text-cream-200/80 leading-relaxed">
            {category?.description ||
              'تصفح باقة مختارة من أندر وأجود العطور الفاخرة المعتمدة لدى قصر العطور مع شحن فوري لكافة محافظات مصر.'}
          </p>
          <div className="text-xs text-gold-400 font-bold pt-1">
            إجمالي المعروض: {totalCount} منتجاً
          </div>
        </div>
      </div>

      {/* Main Grid & Filters Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h3 className="font-bold text-base text-emerald-950 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gold-600" />
              <span>تصفية النتائج</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-gold-700 hover:text-emerald-950 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>مسح</span>
              </button>
            )}
          </div>

          {/* 1. In Stock Only Filter */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="w-4 h-4 text-gold-600 rounded border-gray-300 focus:ring-gold-500"
              />
              <span className="text-sm font-semibold text-gray-700">المتوفر في المخزون فقط</span>
            </label>
          </div>

          {/* 2. Gender Filter */}
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
              الفئة المستهدفة
            </span>
            <div className="space-y-1.5">
              {[
                { label: 'الكل', value: '' },
                { label: 'للجنسين (Unisex)', value: 'UNISEX' },
                { label: 'رجالي (Men)', value: 'MEN' },
                { label: 'نسائي (Women)', value: 'WOMEN' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSelectedGender(opt.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-right px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedGender === opt.value
                      ? 'bg-gold-50 text-gold-900 font-bold border border-gold-300'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  {selectedGender === opt.value && <Check className="w-3.5 h-3.5 text-gold-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Scent Family Filter */}
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
              العائلة العطرية
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'العود', value: 'OUD' },
                { label: 'المسك', value: 'MUSK' },
                { label: 'العنبر', value: 'AMBER' },
                { label: 'شرقي', value: 'ORIENTAL' },
                { label: 'أخشاب', value: 'WOODY' },
                { label: 'أزهار', value: 'FLORAL' },
                { label: 'منعش', value: 'FRESH' },
                { label: 'توابل', value: 'SPICY' },
              ].map((fam) => (
                <button
                  key={fam.value}
                  onClick={() => {
                    setSelectedFamily(selectedFamily === fam.value ? '' : fam.value);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-1.5 rounded-lg text-xs text-center border transition-colors ${
                    selectedFamily === fam.value
                      ? 'bg-emerald-900 text-gold-300 font-bold border-emerald-950'
                      : 'bg-cream-50 text-gray-700 border-gray-200 hover:border-gold-400'
                  }`}
                >
                  {fam.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Price Range Filter */}
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
              نطاق السعر (ج.م)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="من"
                className="w-full p-2 border border-gray-200 rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="إلى"
                className="w-full p-2 border border-gray-200 rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
            </div>
          </div>
        </aside>

        {/* Products Listing Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Sort & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-50 border border-gold-300 text-gold-900 text-xs font-bold"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>الفلاتر ({hasActiveFilters ? 'مفعلة' : 'الكل'})</span>
              </button>

              <span className="text-xs text-gray-500">
                عرض {products.length} من أصل {totalCount} منتجاً
              </span>
            </div>

            {/* Sorting Dropdown (PRD P0-F004) */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-gray-500 shrink-0">الترتيب:</span>
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-cream-50 border border-gray-200 rounded-xl text-xs font-semibold text-emerald-950 focus:outline-none focus:ring-1 focus:ring-gold-500"
              >
                <option value="newest">الأحدث وصولاً</option>
                <option value="price_asc">السعر: من الأقل للأعلى</option>
                <option value="price_desc">السعر: من الأعلى للأقل</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400">الفلاتر المطبقة:</span>
              {selectedGender && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-100 text-gold-900 text-xs font-semibold">
                  {selectedGender === 'MEN' ? 'رجالي' : selectedGender === 'WOMEN' ? 'نسائي' : 'للجنسين'}
                  <button onClick={() => setSelectedGender('')}>
                    <X className="w-3 h-3 hover:text-red-600" />
                  </button>
                </span>
              )}
              {selectedFamily && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-100 text-gold-900 text-xs font-semibold">
                  {selectedFamily}
                  <button onClick={() => setSelectedFamily('')}>
                    <X className="w-3 h-3 hover:text-red-600" />
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-100 text-gold-900 text-xs font-semibold">
                  متوفر بالمخزون فقط
                  <button onClick={() => setInStockOnly(false)}>
                    <X className="w-3 h-3 hover:text-red-600" />
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-red-600 hover:underline font-semibold"
              >
                مسح الكل
              </button>
            </div>
          )}

          {/* Products Grid (24 per page per PRD P0-F004) */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Alternate Flow A1 / A2: No products found */
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mx-auto text-gold-600">
                <SlidersHorizontal className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                {hasActiveFilters
                  ? 'لا توجد منتجات تطابق اختياراتك الحالية'
                  : 'لا توجد منتجات متاحة في هذا القسم حالياً'}
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {hasActiveFilters
                  ? 'جرب تقليل الفلاتر المحددة أو تغيير نطاق السعر لعرض المزيد من العطور الملكية.'
                  : 'سيتم إضافة تشكيلات عطرية جديدة لهذا القسم قريباً.'}
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 rounded-full bg-gold-500 hover:bg-gold-600 text-emerald-950 font-bold text-xs transition-colors shadow-sm"
                >
                  مسح الفلاتر
                </button>
              ) : (
                <Link
                  href="/categories/all"
                  className="inline-block px-6 py-2.5 rounded-full bg-emerald-900 text-gold-400 font-bold text-xs"
                >
                  تصفح باقي الأقسام
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => {
                const primaryVariant = product.variants?.[0];
                const image =
                  product.images?.[0]?.imageUrl ||
                  'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=400';

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gold-300 shadow-sm hover:shadow-luxury transition-all duration-300 flex flex-col group"
                  >
                    <Link
                      href={`/products/${product.id}`}
                      className="relative aspect-square overflow-hidden bg-cream-50"
                    >
                      <img
                        src={image}
                        alt={product.nameAr}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 flex flex-col gap-1">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-900 text-gold-400 text-[10px] font-bold">
                          {product.category?.nameAr || 'عطور'}
                        </span>
                      </div>
                    </Link>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] text-gold-700 font-semibold uppercase block mb-1">
                          {product.brand}
                        </span>
                        <Link href={`/products/${product.id}`}>
                          <h3 className="font-bold text-base text-emerald-950 hover:text-gold-700 transition-colors line-clamp-1">
                            {product.nameAr}
                          </h3>
                        </Link>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {product.descriptionAr}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-400 block">السعر يبدأ من</span>
                          <span className="text-base font-black text-emerald-900">
                            {primaryVariant
                              ? `${primaryVariant.priceEgp.toLocaleString()} ج.م`
                              : 'غير محدد'}
                          </span>
                        </div>

                        {primaryVariant && (
                          <button
                            onClick={() => addToCart(primaryVariant.id, 1)}
                            className="px-3.5 py-2 rounded-xl bg-gold-500 hover:bg-gold-600 text-emerald-950 font-bold text-xs transition-colors shadow-sm"
                          >
                            أضف للسلة
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination (PRD P0-F004) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                      currentPage === pageNum
                        ? 'bg-emerald-900 text-gold-400 shadow-md'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gold-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Award,
  Flame,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';
import { Category, Product } from '../types';
import { apiRequest } from '../lib/api';
import { useCart } from '../lib/cart-context';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadHomeData() {
      try {
        setIsLoading(true);
        // Load published categories (up to 20 per PRD P0-F003)
        const catRes = await apiRequest<{ success: boolean; data: { categories: Category[] } }>(
          '/categories'
        );
        if (catRes.success && catRes.data?.categories) {
          setCategories(catRes.data.categories);
        }

        // Load featured products
        const prodRes = await apiRequest<{ success: boolean; data: { products: Product[] } }>(
          '/products?limit=8&sort=newest'
        );
        if (prodRes.success && prodRes.data?.products) {
          setFeaturedProducts(prodRes.data.products);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Luxury Hero Banner */}
      <section className="relative overflow-hidden bg-emerald-950 text-white py-20 lg:py-28">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-gold-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-emerald-850/60 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-right">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900 border border-gold-500/40 text-gold-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>إصدارات ملكية خاصة 2026 — قصر العطور</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
                أصالة الشرق <br />
                <span className="text-gold-gradient">بلمسات ملكية فاخرة</span>
              </h1>

              <p className="text-cream-200/90 text-sm sm:text-base max-w-xl leading-relaxed mx-auto lg:mx-0">
                اكتشف توليفاتنا الحصرية من أندر أنواع دهن العود المعتق، المسك الأبيض، والعنبر الفاخر، مصممة بعناية لتعكس شخصيتك الراقية. نوصل لجميع محافظات مصر مع خيار الدفع عند الاستلام.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/categories/all"
                  className="px-8 py-3.5 rounded-full bg-gold-gradient text-emerald-950 font-bold hover:brightness-105 transition-all shadow-gold flex items-center gap-2 text-sm"
                >
                  <span>تسوق التشكيلات (20 قسم)</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>

                <Link
                  href="/categories/best-sellers"
                  className="px-6 py-3.5 rounded-full border border-gold-400/60 text-gold-300 hover:bg-gold-500/10 transition-colors font-semibold text-sm"
                >
                  الأكثر مبيعاً
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-emerald-900/80 text-center lg:text-right">
                <div>
                  <span className="block text-2xl font-bold text-gold-400">100%</span>
                  <span className="text-xs text-cream-300">نقاء وجودة أصلية</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-gold-400">20+</span>
                  <span className="text-xs text-cream-300">قسماً متنوعاً</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-gold-400">جميع</span>
                  <span className="text-xs text-cream-300">محافظات مصر</span>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden border-2 border-gold-500/40 shadow-2xl shadow-emerald-950">
                <img
                  src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1000"
                  alt="قصر العطور الملكي"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent opacity-70" />
                <div className="absolute bottom-6 right-6 left-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gold-400 font-bold block">مجموعة العود الملوكي</span>
                    <h4 className="text-base font-bold">العود الكمبودي المعتق</h4>
                  </div>
                  <span className="text-sm font-bold text-gold-300">من 1,450 ج.م</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Authenticity Promise Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-950 text-white p-6 sm:p-8 border border-gold-500/30 shadow-luxury flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center text-emerald-950 shrink-0">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                تعهد الأصالة والضمان الذهبي من قصر العطور
              </h3>
              <p className="text-xs sm:text-sm text-cream-200/80 leading-relaxed">
                نلتزم بتوفير عطور نقية غير مغشوشة، معبأة وفق أعلى المعايير الصحية ومستخلصة من مصادرها الطبيعية المعتمدة. استرجع قيمة طلبك إن لم تكن راضياً بنسبة 100%.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gold-400 text-xs font-bold shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>معتمد ومطابق للمواصفات</span>
          </div>
        </div>
      </section>

      {/* 3. The 20 Categories Grid (PRD P0-F003) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-gold-700 text-xs font-bold mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span>تصفح حسب الذوق والتصنيف</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-950">
              تشكيلات قصر العطور (20 قسماً)
            </h2>
          </div>
          <Link
            href="/categories/all"
            className="text-sm font-bold text-gold-700 hover:text-emerald-900 flex items-center gap-1 transition-colors"
          >
            <span>عرض كافة الأقسام</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-44" />
              ))
            : categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-gold transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
                    <img
                      src={
                        cat.imageUrl ||
                        'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=400'
                      }
                      alt={cat.nameAr}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs text-[10px] text-white font-medium">
                      #{cat.displayPosition}
                    </span>
                  </div>

                  <div className="p-3 bg-white text-center flex-1 flex flex-col justify-between">
                    <h3 className="font-bold text-sm text-emerald-950 group-hover:text-gold-700 transition-colors">
                      {cat.nameAr}
                    </h3>
                    <span className="text-[11px] text-gray-500 block mt-1">
                      {cat.productCount !== undefined ? `${cat.productCount} منتج` : 'عرض التشكيلة'}
                    </span>
                  </div>
                </Link>
              ))}
        </div>
      </section>

      {/* 4. Featured Perfumes Showcase */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-gold-700 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>مختارات ملكية متميزة</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-emerald-950">
                أحدث عطور قصر العطور
              </h2>
            </div>
            <Link
              href="/categories/all"
              className="text-sm font-bold text-gold-700 hover:text-emerald-900 flex items-center gap-1"
            >
              <span>تصفح الكل</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => {
              const primaryVariant = product.variants?.[0];
              const image =
                product.images?.[0]?.imageUrl ||
                'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=400';

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gold-300 shadow-sm hover:shadow-luxury transition-all duration-300 flex flex-col group"
                >
                  <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-cream-50">
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
                          {primaryVariant ? `${primaryVariant.priceEgp.toLocaleString()} ج.م` : 'غير محدد'}
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
        </section>
      )}
    </div>
  );
}


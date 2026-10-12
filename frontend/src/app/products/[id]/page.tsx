'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { Product, ProductVariant } from '../../../types';
import { apiRequest } from '../../../lib/api';
import { useCart } from '../../../lib/cart-context';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { addToCart, openCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadProduct() {
      try {
        setIsLoading(true);
        const res = await apiRequest<{ success: boolean; data: { product: Product } }>(
          `/products/${id}`
        );
        if (res.success && res.data.product) {
          const prod = res.data.product;
          setProduct(prod);
          if (prod.variants && prod.variants.length > 0) {
            setSelectedVariant(prod.variants[0]);
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'فشل تحميل بيانات المنتج');
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-gray-200 rounded-3xl aspect-square" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-10 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-gold-600 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-800">
          {errorMessage || 'هذا المنتج لم يعد متوفراً.'}
        </h2>
        <p className="text-sm text-gray-500">
          ربما تم نقل المنتج أو انتهاء كميته. تصفح باقي تشكيلاتنا الملكية.
        </p>
        <Link
          href="/categories/all"
          className="inline-block px-8 py-3 rounded-full bg-emerald-900 text-gold-400 font-bold text-sm"
        >
          العودة للكتالوج
        </Link>
      </div>
    );
  }

  const images = product.images?.length > 0
    ? product.images
    : [{ id: '1', imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800', r2Key: '', position: 1, productId: product.id }];

  const isOutOfStock = !selectedVariant || selectedVariant.stockQuantity <= 0;

  const handleAddToCart = async () => {
    if (!selectedVariant || isOutOfStock) return;
    setIsAdding(true);
    await addToCart(selectedVariant.id, quantity);
    setIsAdding(false);
  };

  const handleBuyNow = async () => {
    if (!selectedVariant || isOutOfStock) return;
    await addToCart(selectedVariant.id, quantity);
    router.push('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-emerald-900">الرئيسية</Link>
        <span>/</span>
        <Link href={`/categories/${product.category?.slug || 'all'}`} className="hover:text-emerald-900">
          {product.category?.nameAr || 'القسم'}
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-semibold">{product.nameAr}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Gallery Section (up to 8 images per PRD) */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-luxury">
            <img
              src={images[selectedImageIndex]?.imageUrl}
              alt={product.nameAr}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 backdrop-blur-xs text-gold-400 text-xs font-bold border border-gold-500/40">
                {product.brand}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-gold-500 ring-2 ring-gold-400/40'
                      : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-gold-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مجموعة ملكية معتمدة</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-emerald-950">
              {product.nameAr}
            </h1>
            <span className="text-sm font-semibold text-gray-400 block mt-1 tracking-wider uppercase">
              {product.nameEn}
            </span>
          </div>

          {/* Live Price Display (updates < 200ms on variant change per PRD P0-F005) */}
          <div className="flex items-baseline gap-4 p-4 rounded-2xl bg-cream-100 border border-gold-200/60">
            <span className="text-3xl font-black text-emerald-950">
              {selectedVariant ? `${selectedVariant.priceEgp.toLocaleString()} ج.م` : 'غير متوفر'}
            </span>
            <span className="text-xs text-gray-500">شامل ضريبة القيمة المضافة</span>
          </div>

          {/* Scent Notes Pyramid (الهرم العطري) */}
          <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-2">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              الهرم والملاحظات العطرية:
            </h4>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
              {product.scentNotes}
            </p>
          </div>

          {/* Size Variants Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-700 block">
              اختر الحجم (مل):
            </label>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVariant(v);
                    setQuantity(1);
                  }}
                  className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all flex items-center gap-2 ${
                    selectedVariant?.id === v.id
                      ? 'bg-emerald-900 text-gold-400 border-emerald-950 shadow-md'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gold-400'
                  }`}
                >
                  <span>{v.sizeMl} مل</span>
                  <span className="text-xs font-normal opacity-80">
                    ({v.priceEgp.toLocaleString()} ج.م)
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Stock Status Indicator */}
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>نفدت الكمية من هذا الحجم حالياً</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>متوفر بالمخزون ({selectedVariant?.stockQuantity} قطعة متاحة)</span>
              </span>
            )}
          </div>

          {/* Quantity Stepper & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-4 items-center">
              {/* Stepper */}
              <div className="flex items-center border border-gray-200 rounded-2xl bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-bold text-sm text-gray-800">{quantity}</span>
                <button
                  onClick={() => {
                    if (selectedVariant && quantity < selectedVariant.stockQuantity) {
                      setQuantity(quantity + 1);
                    }
                  }}
                  disabled={isOutOfStock || (selectedVariant ? quantity >= selectedVariant.stockQuantity : true)}
                  className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-gold-500 hover:bg-gold-600 text-emerald-950 font-bold text-sm shadow-gold transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'نفدت الكمية' : isAdding ? 'جاري الإضافة...' : 'أضف إلى السلة'}</span>
              </button>
            </div>

            {/* Buy Now CTA */}
            {!isOutOfStock && (
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-900 hover:bg-emerald-950 text-gold-400 font-bold text-sm transition-colors shadow-luxury flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>شراء الآن والدفع عند الاستلام</span>
              </button>
            )}
          </div>

          {/* Authenticity Guarantee Card (PRD P0-F005) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 to-emerald-900 text-white border border-gold-500/40 space-y-2">
            <div className="flex items-center gap-2 text-gold-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>بيان وضمان الأصالة المعتمد (100% أصلي)</span>
            </div>
            <p className="text-xs text-cream-200/90 leading-relaxed">
              {product.authenticityStatement ||
                'نضمن في قصر العطور أصالة ونقاء هذا العطر بنسبة 100%. تم استخلاصه وتعتيقه من زيوت طبيعية معتمدة مع ضمان استرجاع كامل في حال عدم مطابقة المواصفات.'}
            </p>
          </div>

          {/* Delivery & Payment Highlights */}
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-gold-600 shrink-0" />
              <span>توصيل خلال 24 - 48 ساعة</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gold-600 shrink-0" />
              <span>دفع عند الاستلام نقداً متاح</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


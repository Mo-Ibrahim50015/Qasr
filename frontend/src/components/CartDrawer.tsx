'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Trash2, Plus, Minus, Tag, ShoppingBag, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useCart } from '../lib/cart-context';

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const { cart, isCartOpen, closeCart, updateQuantity, removeItem, applyDiscount, isLoading } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    setCouponMessage(null);

    const res = await applyDiscount(couponCode.trim().toUpperCase());
    setIsApplyingCoupon(false);

    if (res.success) {
      setCouponMessage({ text: res.message, isError: false });
    } else {
      setCouponMessage({ text: res.message, isError: true });
    }
  };

  const handleCheckoutClick = () => {
    closeCart();
    router.push('/checkout');
  };

  const items = cart?.items || [];
  const freeShippingThreshold = 1000;
  const currentSubtotal = cart?.subtotalEgp || 0;
  const progressPercent = Math.min(100, Math.round((currentSubtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-cream-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-900" />
              <h3 className="font-bold text-lg text-emerald-950">سلة المشتريات</h3>
              <span className="text-xs bg-gold-500/20 text-gold-800 px-2 py-0.5 rounded-full font-bold">
                {items.length} منتجات
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-6 py-3 bg-emerald-900 text-cream-100 text-xs">
            <div className="flex justify-between items-center mb-1">
              <span>
                {currentSubtotal >= freeShippingThreshold
                  ? 'تهانينا! حصلت على شحن مجاني لكافة محافظات مصر 🎉'
                  : `أضف بقيمة ${(freeShippingThreshold - currentSubtotal).toLocaleString()} ج.م للحصول على شحن مجاني`}
              </span>
              <span className="font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-emerald-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 rounded-full bg-cream-100 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 text-gold-600/60" />
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-1">سلتك فارغة حالياً</h4>
                <p className="text-sm text-gray-500 mb-6">
                  استكشف تشكيلاتنا الملكية من العطور والعود وأضف ما يعجبك.
                </p>
                <Link
                  href="/categories/all"
                  onClick={closeCart}
                  className="px-6 py-2.5 rounded-full bg-emerald-900 text-gold-400 font-semibold text-sm hover:bg-emerald-950 transition-colors"
                >
                  تصفح تشكيلات العطور
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const product = item.variant?.product;
                const image = product?.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=300';
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 rounded-xl border border-gray-100 hover:border-gold-300 transition-colors bg-cream-50/50"
                  >
                    <img
                      src={image}
                      alt={product?.nameAr || 'عطر'}
                      className="w-20 h-20 object-cover rounded-lg shrink-0 border border-gray-100"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-emerald-950 line-clamp-1">
                            {product?.nameAr}
                          </h4>
                          <span className="text-xs text-gray-500 block">
                            حجم {item.variant.sizeMl} مل
                          </span>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={isLoading}
                            className="p-1 hover:bg-gray-100 text-gray-600 rounded-r-lg"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={isLoading || item.quantity >= item.variant.stockQuantity}
                            className="p-1 hover:bg-gray-100 text-gray-600 rounded-l-lg disabled:opacity-30"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="font-bold text-sm text-emerald-900">
                          {(item.variant.priceEgp * item.quantity).toLocaleString()} ج.م
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-cream-50 space-y-4">
              {/* Product-Specific Discount Code Input (PRD P0-F006 & P0-F010) */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="أدخل كود الخصم (مثال: QASR10)"
                      className="w-full pr-9 pl-3 py-2 border border-gold-300 rounded-lg text-xs uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {isApplyingCoupon ? 'تحقق...' : 'تطبيق'}
                  </button>
                </div>
                {couponMessage && (
                  <p
                    className={`text-xs ${
                      couponMessage.isError ? 'text-red-600' : 'text-emerald-700 font-semibold'
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}
                {cart?.appliedDiscountCode && !couponMessage && (
                  <p className="text-xs text-emerald-700 font-semibold">
                    ✓ الكود المفعل: {cart.appliedDiscountCode}
                  </p>
                )}
              </form>

              {/* Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-200">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span className="font-semibold text-gray-800">
                    {cart?.subtotalEgp.toLocaleString()} ج.م
                  </span>
                </div>

                {cart && cart.discountEgp > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>خصم الكود:</span>
                    <span>-{cart.discountEgp.toLocaleString()} ج.م</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>الشحن:</span>
                  <span className="font-semibold text-gray-800">
                    {cart?.shippingFeeEgp === 0 ? 'مجاني' : `${cart?.shippingFeeEgp} ج.م`}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-bold text-emerald-950 pt-2 border-t border-gray-200">
                  <span>الإجمالي النهائي:</span>
                  <span className="text-base text-gold-700">
                    {cart?.totalEgp.toLocaleString()} ج.م
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 rounded-full bg-emerald-900 text-gold-400 font-bold hover:bg-emerald-950 transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <span>متابعة إتمام الطلب</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>دفع آمن بالكامل ومتاح الدفع عند الاستلام</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


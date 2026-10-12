import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, CreditCard, RotateCcw, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-emerald-950 text-cream-100 border-t-2 border-gold-600/40 pt-16 pb-8">
      {/* Brand Value Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-8 border-y border-emerald-900/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-900 border border-gold-500/50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">ضمان أصالة 100%</h4>
              <p className="text-xs text-cream-200/80">عطور أصلية مستخلصة بأعلى المعايير</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-900 border border-gold-500/50 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">شحن لكافة محافظات مصر</h4>
              <p className="text-xs text-cream-200/80">توصيل سريع للقاهرة، الإسكندرية وجميع الأقاليم</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-900 border border-gold-500/50 flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">دفع عند الاستلام متاح</h4>
              <p className="text-xs text-cream-200/80">ادفع نقداً عند استلام ومعاينة شحنتك</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-900 border border-gold-500/50 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">سياسة استبدال مرنة</h4>
              <p className="text-xs text-cream-200/80">ضمان تجربة تسوق راقية وموثوقة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-emerald-900 border border-gold-500 flex items-center justify-center text-gold-400 font-bold">
              ق
            </div>
            <span className="text-xl font-bold text-white tracking-wide">قصر العطور</span>
          </div>
          <p className="text-sm text-cream-300/80 leading-relaxed">
            الوجهة الأولى والموثوقة في جمهورية مصر العربية لاقتناء أندر وأرقى أنواع العود، المسك، العنبر، والعطور الشرقية والفرنسية الملكية.
          </p>
        </div>

        <div>
          <h5 className="text-white font-bold text-sm mb-4 border-r-2 border-gold-500 pr-2">
            أقسام المتجر الرئيسية
          </h5>
          <ul className="space-y-2 text-sm text-cream-200/80">
            <li><Link href="/categories/oud" className="hover:text-gold-400 transition-colors">العود الشرقي</Link></li>
            <li><Link href="/categories/musk" className="hover:text-gold-400 transition-colors">المسك الملكي</Link></li>
            <li><Link href="/categories/amber" className="hover:text-gold-400 transition-colors">العنبر الفاخر</Link></li>
            <li><Link href="/categories/french-perfumes" className="hover:text-gold-400 transition-colors">عطور فرنسية</Link></li>
            <li><Link href="/categories/all" className="text-gold-400 font-semibold hover:underline">عرض جميع الـ 20 قسماً ←</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-bold text-sm mb-4 border-r-2 border-gold-500 pr-2">
            خدمة العملاء
          </h5>
          <ul className="space-y-3 text-sm text-cream-200/80">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gold-400 shrink-0" />
              <span>+20 100 000 0001 (واتساب ومكالمات)</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gold-400 shrink-0" />
              <span>support@qasralotoor.com</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold-400 shrink-0" />
              <span>القاهرة، جمهورية مصر العربية</span>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-bold text-sm mb-4 border-r-2 border-gold-500 pr-2">
            طرق الدفع المعتمدة
          </h5>
          <p className="text-xs text-cream-300/80 mb-4 leading-relaxed">
            نوفر الدفع عند الاستلام نقداً في كافة المحافظات، بالإضافة للدفع الإلكتروني الآمن بالبطاقات والمحافظ عبر بوابتنا المعتمدة (Paymob).
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-emerald-950">
            <span className="px-2.5 py-1 bg-white rounded shadow-sm">الدفع عند الاستلام (COD)</span>
            <span className="px-2.5 py-1 bg-white rounded shadow-sm">فيزا / ماستركارد</span>
            <span className="px-2.5 py-1 bg-white rounded shadow-sm">ميزة Meeza</span>
            <span className="px-2.5 py-1 bg-white rounded shadow-sm">فودافون كاش / إنستاباي</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-emerald-900/80 pt-6 text-center text-xs text-cream-300/60">
        © 2026 قصر العطور (Qasr Al Otoor). جميع الحقوق محفوظة ومسجلة طبقاً للقوانين المصرية.
      </div>
    </footer>
  );
};


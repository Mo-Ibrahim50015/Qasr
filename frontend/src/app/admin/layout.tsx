'use client';

import React from 'react';
import Link from 'next/navigation';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  Tag,
  ShoppingBag,
  Sliders,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-12 text-center text-sm text-gray-500">
        جاري التحقق من صلاحيات الإدارة...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-red-200 text-center space-y-4 shadow-luxury">
        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="text-xl font-bold text-gray-800">الدخول محظور (Access Denied)</h2>
        <p className="text-xs text-gray-500">
          هذه الصفحة مخصصة لمدير النظام (Admin) فقط لإدارة الكتالوج، الأكواد، الطلبات، وإعدادات الدفع.
        </p>
        <a
          href="/auth/login"
          className="inline-block px-6 py-2.5 rounded-full bg-emerald-900 text-gold-400 font-bold text-xs"
        >
          تسجيل الدخول بحساب المدير
        </a>
      </div>
    );
  }

  const navItems = [
    { label: 'نظرة عامة والإحصائيات', href: '/admin', icon: LayoutDashboard },
    { label: 'إدارة المنتجات (1000 منتج)', href: '/admin/products', icon: Package },
    { label: 'أقسام المتجر الـ 20', href: '/admin/categories', icon: Layers },
    { label: 'أكواد الخصم للمنتجات', href: '/admin/discount-codes', icon: Tag },
    { label: 'إدارة الطلبات والتحصيل', href: '/admin/orders', icon: ShoppingBag },
    { label: 'إعدادات الدفع والاستلام (COD)', href: '/admin/payment-settings', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-cream-50/70 pb-16">
      {/* Admin Subheader Bar */}
      <div className="bg-emerald-950 text-white border-b border-gold-600/30 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            <h2 className="text-lg font-bold text-white">لوحة تحكم إدارة قصر العطور</h2>
            <span className="text-xs bg-gold-500/20 text-gold-400 px-2.5 py-0.5 rounded-full font-mono">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-cream-300">المدير: {user.fullName}</span>
            <a
              href="/"
              className="text-gold-400 hover:text-white font-semibold flex items-center gap-1 transition-colors"
            >
              <span>معاينة واجهة المتجر</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-gray-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                  isActive
                    ? 'bg-emerald-900 text-gold-400 shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gold-50 border border-gray-200/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>

        {/* Content View */}
        <div>{children}</div>
      </div>
    </div>
  );
}


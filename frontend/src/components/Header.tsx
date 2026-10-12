'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  User,
  Search,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  LogOut,
  LayoutDashboard,
  PackageCheck,
} from 'lucide-react';
import { useCart } from '../lib/cart-context';
import { useAuth } from '../lib/auth-context';

export const Header: React.FC = () => {
  const router = useRouter();
  const { itemsCount, openCart } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/categories/all?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gold-200/40 shadow-sm">
      {/* Top Announcement Bar */}
      <div className="bg-emerald-950 text-gold-400 text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
        <span>توصيل لكافة محافظات مصر • دفع عند الاستلام • ضمان أصالة ونقاء 100%</span>
        <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-emerald-950 hover:bg-gold-50"
            aria-label="القائمة الرئيسية"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-emerald-950" />}
          </button>

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-emerald-900 border-2 border-gold-500 flex items-center justify-center shadow-gold group-hover:scale-105 transition-transform">
              <span className="text-gold-400 font-bold text-xl">ق</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-950 group-hover:text-gold-700 transition-colors">
                قصر العطور
              </span>
              <span className="text-[10px] tracking-widest text-gold-600 font-semibold uppercase">
                Qasr Al Otoor
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-6 relative items-center"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن عطرك المفضل، ماركة، أو نوتة عطرية..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gold-300/80 bg-cream-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="absolute left-3 text-gold-600 hover:text-emerald-900 transition-colors"
              aria-label="بحث"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Navigation & Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* 20 Categories Quick Link */}
            <Link
              href="/categories/all"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-emerald-900 hover:bg-gold-50 transition-colors"
            >
              <span>جميع التشكيلات (20 قسم)</span>
              <ChevronDown className="w-4 h-4 text-gold-600" />
            </Link>

            {/* Authenticity Guarantee Pill */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-50 border border-gold-200 text-gold-800 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-gold-600" />
              <span>أصالة 100%</span>
            </div>

            {/* User Account Dropdown */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-full hover:bg-gold-50 text-emerald-900"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-900 font-bold text-sm">
                      {user.fullName.charAt(0)}
                    </div>
                    <span className="hidden sm:inline text-sm font-semibold max-w-[120px] truncate">
                      {user.fullName}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-500">
                        {user.email || user.phone}
                      </div>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-emerald-900 hover:bg-gold-50 font-semibold"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gold-600" />
                          <span>لوحة تحكم الإدارة</span>
                        </Link>
                      )}

                      <Link
                        href="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gold-50"
                      >
                        <PackageCheck className="w-4 h-4 text-gray-500" />
                        <span>طلباتي السابقة</span>
                      </Link>

                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-right"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full border border-gold-400 text-emerald-950 hover:bg-gold-50 text-sm font-semibold transition-colors"
                >
                  <User className="w-4 h-4 text-gold-600" />
                  <span>دخول / تسجيل</span>
                </Link>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-full bg-emerald-900 text-gold-400 hover:bg-emerald-950 transition-colors shadow-md"
              aria-label="سلة التسوق"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gold-500 text-emerald-950 text-xs font-bold flex items-center justify-center border-2 border-white animate-scale">
                  {itemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن عطرك المفضل..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gold-200 bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
            <button type="submit" className="absolute left-3 text-gold-600">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/categories/all"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-emerald-950 font-bold border-b border-gray-100"
          >
            تصفح جميع الأقسام الـ 20
          </Link>
          <Link
            href="/categories/oud"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-1.5 text-gray-700 text-sm"
          >
            العود الشرقي الفاخر
          </Link>
          <Link
            href="/categories/musk"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-1.5 text-gray-700 text-sm"
          >
            المسك الملكي
          </Link>
          <Link
            href="/categories/amber"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-1.5 text-gray-700 text-sm"
          >
            العنبر الفاخر
          </Link>
          <Link
            href="/categories/french-perfumes"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-1.5 text-gray-700 text-sm"
          >
            العطور الفرنسية
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-gold-700 font-bold border-t border-gray-100"
            >
              لوحة الإدارة
            </Link>
          )}
        </div>
      )}
    </header>
  );
};


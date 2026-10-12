import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import { CartProvider } from '../lib/cart-context';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';

export const metadata: Metadata = {
  title: 'قصر العطور | Qasr Al Otoor — أرقى العطور الشرقية والملكية في مصر',
  description:
    'المتجر الرسمي لعلامة قصر العطور في جمهورية مصر العربية. تشكيلة فاخرة من العود، المسك، العنبر، وأرقى العطور الفرنسية والشرقية مع الدفع عند الاستلام وضمان أصالة 100%.',
  keywords: [
    'عطور مصر',
    'قصر العطور',
    'عود ملكي',
    'مسك الطهارة',
    'عنبر',
    'عطور رجالية فخمة',
    'عطور نسائية',
    'دفع عند الاستلام عطور',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col font-arabic bg-cream-50/50 text-gray-900 antialiased selection:bg-gold-500 selection:text-white">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <CartDrawer />
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


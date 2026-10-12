import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/mock-store';
import { Product } from '../../../../types';

// Helper to extract session or auth identifier
function getSessionKey(req: NextRequest): string {
  return (
    req.headers.get('x-session-id') ||
    req.headers.get('authorization')?.replace('Bearer ', '') ||
    'default-session'
  );
}

// GET Handler
export async function GET(req: NextRequest, { params }: { params: { route: string[] } }) {
  const parts = params.route;
  const path = parts.join('/');
  const { searchParams } = new URL(req.url);

  // 1. GET /api/v1/categories
  if (path === 'categories') {
    return NextResponse.json({
      success: true,
      data: { categories: db.categories.filter((c) => c.published) },
    });
  }

  // 2. GET /api/v1/categories/admin/all
  if (path === 'categories/admin/all') {
    return NextResponse.json({
      success: true,
      data: { categories: db.categories },
    });
  }

  // 3. GET /api/v1/categories/:slug
  if (parts[0] === 'categories' && parts.length === 2) {
    const cat = db.categories.find((c) => c.slug === parts[1]);
    if (!cat) return NextResponse.json({ success: false, message: 'القسم غير موجود' }, { status: 404 });
    return NextResponse.json({ success: true, data: { category: cat } });
  }

  // 4. GET /api/v1/products
  if (path === 'products') {
    const categorySlug = searchParams.get('categorySlug');
    const gender = searchParams.get('gender');
    const scentFamily = searchParams.get('scentFamily');
    const inStock = searchParams.get('inStock') === 'true';
    const sort = searchParams.get('sort') || 'newest';
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 24;

    let filtered = db.products.filter((p) => p.published && !p.archivedAt);

    if (categorySlug && categorySlug !== 'all') {
      const cat = db.categories.find((c) => c.slug === categorySlug);
      if (cat) {
        filtered = filtered.filter((p) => p.categoryId === cat.id);
      }
    }

    if (gender) filtered = filtered.filter((p) => p.gender === gender);
    if (scentFamily) filtered = filtered.filter((p) => p.scentFamily === scentFamily);
    if (inStock) filtered = filtered.filter((p) => p.variants.some((v) => v.stockQuantity > 0));

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.nameAr.toLowerCase().includes(search) ||
          p.nameEn.toLowerCase().includes(search) ||
          p.brand.toLowerCase().includes(search) ||
          p.scentNotes.toLowerCase().includes(search)
      );
    }

    if (sort === 'price_asc') {
      filtered.sort((a, b) => (a.variants[0]?.priceEgp || 0) - (b.variants[0]?.priceEgp || 0));
    } else if (sort === 'price_desc') {
      filtered.sort((a, b) => (b.variants[0]?.priceEgp || 0) - (a.variants[0]?.priceEgp || 0));
    }

    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      data: {
        products: paginated,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  }

  // 5. GET /api/v1/products/admin/all
  if (path === 'products/admin/all') {
    return NextResponse.json({
      success: true,
      data: {
        products: db.products,
        pagination: { total: db.products.length, page: 1, limit: 50 },
      },
    });
  }

  // 6. GET /api/v1/products/:id
  if (parts[0] === 'products' && parts.length === 2) {
    const prod = db.products.find((p) => p.id === parts[1]);
    if (!prod || prod.archivedAt) {
      return NextResponse.json({ success: false, message: 'المنتج غير موجود أو لم يعد متاحاً' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { product: prod } });
  }

  // 7. GET /api/v1/cart
  if (path === 'cart') {
    const sessKey = getSessionKey(req);
    const cartData = db.carts.get(sessKey) || { items: [], appliedDiscountCode: null };
    const summary = calculateCartTotals(cartData);
    return NextResponse.json({ success: true, data: summary });
  }

  // 8. GET /api/v1/checkout/cod-settings
  if (path === 'checkout/cod-settings' || path === 'admin/payment-settings') {
    return NextResponse.json({ success: true, data: { settings: db.paymentSettings } });
  }

  // 9. GET /api/v1/orders
  if (path === 'orders') {
    return NextResponse.json({ success: true, data: { orders: db.orders } });
  }

  // 10. GET /api/v1/orders/admin/all
  if (path === 'orders/admin/all') {
    return NextResponse.json({
      success: true,
      data: { orders: db.orders, pagination: { total: db.orders.length } },
    });
  }

  // 11. GET /api/v1/orders/:id
  if (parts[0] === 'orders' && parts.length === 2) {
    const order = db.orders.find((o) => o.id === parts[1]);
    if (!order) return NextResponse.json({ success: false, message: 'الطلب غير موجود' }, { status: 404 });
    return NextResponse.json({ success: true, data: { order } });
  }

  // 12. GET /api/v1/admin/stats
  if (path === 'admin/stats') {
    const totalRev = db.orders
      .filter((o) => ['CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED'].includes(o.status))
      .reduce((acc, o) => acc + o.totalEgp, 0);
    const confirmedCount = db.orders.filter((o) => o.status !== 'CANCELLED').length;
    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalRevenueEgp: totalRev,
          confirmedOrPaidOrders: confirmedCount,
          totalOrders: db.orders.length,
          averageOrderValueEgp: confirmedCount > 0 ? Math.round(totalRev / confirmedCount) : 0,
          codOrdersCount: db.orders.filter((o) => o.paymentMethod === 'COD').length,
          paymobOrdersCount: db.orders.filter((o) => o.paymentMethod === 'PAYMOB').length,
          productCount: db.products.filter((p) => !p.archivedAt).length,
          customerCount: db.users.length,
        },
        recentOrders: db.orders.slice(0, 5),
      },
    });
  }

  // 13. GET /api/v1/admin/discount-codes
  if (path === 'admin/discount-codes') {
    return NextResponse.json({ success: true, data: { codes: db.discountCodes } });
  }

  // 14. GET /api/v1/auth/me
  if (path === 'auth/me') {
    const authHeader = req.headers.get('authorization') || '';
    const tokenPart = authHeader.replace('Bearer ', '').trim();

    if (tokenPart.startsWith('token_user_')) {
      const uid = tokenPart.replace('token_user_', '');
      const matched = db.users.find((u) => u.id === uid);
      if (matched) return NextResponse.json({ success: true, data: { user: matched } });
    }

    if (tokenPart.includes('customer')) {
      const customer = db.users.find((u) => u.role === 'CUSTOMER');
      if (customer) return NextResponse.json({ success: true, data: { user: customer } });
    }

    if (tokenPart === 'mock_access_token_qasr') {
      const admin = db.users.find((u) => u.role === 'ADMIN');
      return NextResponse.json({ success: true, data: { user: admin } });
    }

    // Default to admin only if explicit or fallback
    const user = db.users[0];
    return NextResponse.json({ success: true, data: { user } });
  }

  // 15. GET /api/v1/auth/verify-email
  if (path === 'auth/verify-email') {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const email = url.searchParams.get('email');

    let user = db.users.find(
      (u) =>
        (email && u.email?.toLowerCase() === email.toLowerCase()) ||
        (token && (u as any).verificationToken === token)
    );

    if (!user && email) {
      user = {
        id: `usr-${Date.now()}`,
        fullName: email.split('@')[0],
        email: email.toLowerCase(),
        phone: null,
        role: 'CUSTOMER',
        verifiedAt: new Date().toISOString(),
      };
      db.users.push(user);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'رابط تأكيد الحساب غير صالح أو منتهي الصلاحية.' },
        { status: 400 }
      );
    }

    user.verifiedAt = new Date().toISOString();
    return NextResponse.json({
      success: true,
      message: 'تم تأكيد البريد الإلكتروني بنجاح!',
      data: {
        user,
        accessToken: user.role === 'ADMIN' ? 'mock_access_token_qasr' : `token_user_${user.id}`,
        refreshToken: `refresh_user_${user.id}`,
      },
    });
  }

  return NextResponse.json({ success: false, message: 'Not Found' }, { status: 404 });
}

// POST Handler
export async function POST(req: NextRequest, { params }: { params: { route: string[] } }) {
  const parts = params.route;
  const path = parts.join('/');
  const body = await req.json().catch(() => ({}));
  const sessKey = getSessionKey(req);

  // 1. POST /api/v1/cart/items
  if (path === 'cart/items') {
    const { variantId, quantity = 1 } = body;
    let cartData = db.carts.get(sessKey) || { items: [], appliedDiscountCode: null };
    const existing = cartData.items.find((i) => i.variantId === variantId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cartData.items.push({ id: `item-${Date.now()}`, variantId, quantity });
    }

    db.carts.set(sessKey, cartData);
    const summary = calculateCartTotals(cartData);
    return NextResponse.json({ success: true, message: 'تمت الإضافة للسلة', data: summary });
  }

  // 2. POST /api/v1/cart/discount
  if (path === 'cart/discount') {
    const { code } = body;
    const cleanCode = code ? String(code).trim().toUpperCase() : '';
    const discountCode = db.discountCodes.find((c) => c.code === cleanCode);

    if (!discountCode || !discountCode.active) {
      return NextResponse.json({ success: false, message: 'كود الخصم غير صحيح أو غير مفعل.' }, { status: 400 });
    }

    let cartData = db.carts.get(sessKey) || { items: [], appliedDiscountCode: null };
    cartData.appliedDiscountCode = cleanCode;
    db.carts.set(sessKey, cartData);

    const summary = calculateCartTotals(cartData);
    return NextResponse.json({
      success: true,
      message: `تم تطبيق كود الخصم "${cleanCode}" بنجاح!`,
      data: summary,
    });
  }

  // 3. POST /api/v1/checkout
  if (path === 'checkout') {
    const { paymentMethod, shippingAddress } = body;
    let cartData = db.carts.get(sessKey) || { items: [], appliedDiscountCode: null };
    if (cartData.items.length === 0) {
      return NextResponse.json({ success: false, message: 'سلة المشتريات فارغة.' }, { status: 400 });
    }

    const summary = calculateCartTotals(cartData);
    const orderNumber = `QA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: 'user-guest',
      status: paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING_PAYMENT',
      paymentMethod,
      subtotalEgp: summary.subtotalEgp,
      discountEgp: summary.discountEgp,
      shippingFeeEgp: summary.shippingFeeEgp,
      totalEgp: summary.totalEgp,
      shippingAddress,
      createdAt: new Date().toISOString(),
      items: summary.items.map((i: any) => ({
        id: `oi-${Date.now()}`,
        orderId: `ord-${Date.now()}`,
        variantId: i.variantId,
        productNameSnapshot: `${i.variant?.product?.nameAr} (${i.variant?.sizeMl} مل)`,
        sizeMlSnapshot: i.variant?.sizeMl || 50,
        unitPriceEgp: i.variant?.priceEgp || 0,
        quantity: i.quantity,
      })),
      statusHistory: [
        {
          id: `h-${Date.now()}`,
          orderId: `ord-${Date.now()}`,
          toStatus: paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING_PAYMENT',
          changedBy: 'customer',
          notes: 'تم تأكيد الطلب بنجاح',
          changedAt: new Date().toISOString(),
        },
      ],
    };

    db.orders.unshift(newOrder);
    db.carts.delete(sessKey); // Clear cart

    let paymentUrl = undefined;
    if (paymentMethod === 'PAYMOB') {
      paymentUrl = `/checkout/paymob-mock?order=${newOrder.orderNumber}&amount=${newOrder.totalEgp}`;
    }

    return NextResponse.json({
      success: true,
      message: 'تم تأكيد طلبك بنجاح!',
      data: { order: newOrder, paymentUrl },
    });
  }

  // 4. POST /api/v1/auth/login
  if (path === 'auth/login') {
    const { identifier, password } = body;
    const cleanId = String(identifier || '').trim().toLowerCase();
    const cleanPhone = cleanId.replace(/[\s-]/g, '');

    const foundUser = db.users.find(
      (u) =>
        (u.email && u.email.toLowerCase() === cleanId) ||
        (u.phone && u.phone.replace(/[\s-]/g, '') === cleanPhone)
    );

    const expectedPassword = (foundUser as any)?.password;

    if (!foundUser || !expectedPassword || password !== expectedPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'بيانات الدخول غير صحيحة، يرجى التأكد من البريد/الهاتف وكلمة المرور.',
        },
        { status: 401 }
      );
    }

    const isCustomer = foundUser.role === 'CUSTOMER';
    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح.',
      data: {
        user: foundUser,
        accessToken: isCustomer ? `token_user_${foundUser.id}` : 'mock_access_token_qasr',
        refreshToken: isCustomer ? `refresh_user_${foundUser.id}` : 'mock_refresh_token_qasr',
      },
    });
  }

  // 5. POST /api/v1/auth/register
  if (path === 'auth/register') {
    const { fullName, email, phone, password, verificationType = 'EMAIL', channel = 'SMS' } = body;
    const cleanEmail = email ? String(email).trim().toLowerCase() : null;
    const cleanPhone = phone ? String(phone).replace(/[\s-]/g, '') : null;

    if (!cleanEmail && !cleanPhone) {
      return NextResponse.json(
        { success: false, message: 'يرجى تقديم البريد الإلكتروني أو رقم الهاتف للتسجيل.' },
        { status: 400 }
      );
    }

    const existing = db.users.find(
      (u) =>
        (cleanEmail && u.email?.toLowerCase() === cleanEmail) ||
        (cleanPhone && u.phone?.replace(/[\s-]/g, '') === cleanPhone)
    );

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني أو رقم الهاتف مسجل بالفعل مسبقاً.' },
        { status: 400 }
      );
    }

    const verificationToken = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const otpCode = '123456';
    const isEmailVerification = verificationType === 'EMAIL' || (!cleanPhone && !!cleanEmail);
    const selectedChannel = channel === 'WHATSAPP' ? 'WHATSAPP' : 'SMS';

    const newUser: any = {
      id: `usr-${Date.now()}`,
      fullName: fullName || 'عميل قصر العطور',
      email: cleanEmail,
      phone: cleanPhone,
      password: password || undefined,
      role: 'CUSTOMER',
      verifiedAt: null,
      verificationToken,
      otpCode,
    };
    db.users.push(newUser);

    const verifyLink = `/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(cleanEmail || '')}`;

    return NextResponse.json({
      success: true,
      message: isEmailVerification
        ? 'تم إرسال رابط تأكيد الحساب إلى بريدك الإلكتروني.'
        : `تم إرسال رمز التحقق بنجاح عبر ${selectedChannel === 'WHATSAPP' ? 'واتساب (WhatsApp)' : 'الرسائل القصيرة (SMS)'}.`,
      data: {
        userId: newUser.id,
        verificationType: isEmailVerification ? 'EMAIL' : 'PHONE',
        channel: selectedChannel,
        destination: isEmailVerification ? cleanEmail : cleanPhone,
        verificationLink: verifyLink,
        simulatedOtp: otpCode,
        whatsappText: `مرحباً بك في قصر العطور، رمز التحقق الخاص بك هو: ${otpCode}`,
      },
    });
  }

  // 6. POST /api/v1/auth/verify-email
  if (path === 'auth/verify-email') {
    const { token, email } = body;
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';
    let user = db.users.find(
      (u) =>
        (cleanEmail && u.email?.toLowerCase() === cleanEmail) ||
        (token && (u as any).verificationToken === token)
    );

    if (!user && cleanEmail) {
      user = {
        id: `usr-${Date.now()}`,
        fullName: cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: null,
        role: 'CUSTOMER',
        verifiedAt: new Date().toISOString(),
      };
      db.users.push(user);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'رابط تأكيد الحساب غير صحيح أو منتهي الصلاحية.' },
        { status: 400 }
      );
    }

    user.verifiedAt = new Date().toISOString();
    return NextResponse.json({
      success: true,
      message: 'تم تأكيد البريد الإلكتروني بنجاح!',
      data: {
        user,
        accessToken: user.role === 'ADMIN' ? 'mock_access_token_qasr' : `token_user_${user.id}`,
        refreshToken: `refresh_user_${user.id}`,
      },
    });
  }

  // 7. POST /api/v1/auth/otp/verify
  if (path === 'auth/otp/verify') {
    const { userId, code, destination } = body;
    const user = db.users.find(
      (u) =>
        (userId && u.id === userId) ||
        (destination && (u.phone === destination || u.email === destination))
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'المستخدم غير موجود.' },
        { status: 404 }
      );
    }

    if (code !== '123456' && (user as any).otpCode && (user as any).otpCode !== code) {
      return NextResponse.json(
        { success: false, message: 'رمز التحقق غير صحيح، يرجى إدخال الرمز المكون من 6 أرقام.' },
        { status: 400 }
      );
    }

    user.verifiedAt = new Date().toISOString();
    return NextResponse.json({
      success: true,
      message: 'تم تأكيد الحساب بنجاح.',
      data: {
        user,
        accessToken: user.role === 'ADMIN' ? 'mock_access_token_qasr' : `token_user_${user.id}`,
        refreshToken: `refresh_user_${user.id}`,
      },
    });
  }

  // 8. POST /api/v1/auth/otp/resend
  if (path === 'auth/otp/resend') {
    const { channel = 'SMS', destination } = body;
    const otpCode = '123456';
    const isWhatsApp = channel === 'WHATSAPP';
    return NextResponse.json({
      success: true,
      message: `تم إعادة إرسال رمز التحقق عبر ${isWhatsApp ? 'واتساب (WhatsApp)' : 'الرسائل القصيرة (SMS)'}.`,
      data: {
        simulatedOtp: otpCode,
        channel: isWhatsApp ? 'WHATSAPP' : 'SMS',
        destination,
        whatsappText: `رمز التحقق الجديد الخاص بك في قصر العطور هو: ${otpCode}`,
      },
    });
  }

  // 9. POST /api/v1/auth/google
  if (path === 'auth/google') {
    const { email, fullName, googleId } = body;
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'بيانات حساب Google غير متوفرة أو غير مكتملة.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    // Google Sign-In is strictly for customers, never for Admin
    let user = db.users.find(
      (u) => u.email?.toLowerCase() === cleanEmail && u.role === 'CUSTOMER'
    );

    if (!user) {
      user = {
        id: `usr-google-${Date.now()}`,
        fullName: fullName || 'مستخدم Google',
        email: cleanEmail,
        phone: null,
        role: 'CUSTOMER',
        verifiedAt: new Date().toISOString(),
      };
      db.users.push(user);
    }

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بحساب Google بنجاح.',
      data: {
        user,
        accessToken: `token_user_${user.id}`,
        refreshToken: `refresh_user_${user.id}`,
      },
    });
  }

  // 10. POST /api/v1/auth/facebook
  if (path === 'auth/facebook') {
    const { email, fullName, facebookId } = body;
    const cleanEmail = email
      ? String(email).trim().toLowerCase()
      : `fb_${facebookId || Date.now()}@facebook-user.com`;

    // Facebook Sign-In is strictly for customers, never for Admin
    let user = db.users.find(
      (u) => u.email?.toLowerCase() === cleanEmail && u.role === 'CUSTOMER'
    );

    if (!user) {
      user = {
        id: `usr-fb-${Date.now()}`,
        fullName: fullName || 'مستخدم فيسبوك',
        email: cleanEmail,
        phone: null,
        role: 'CUSTOMER',
        verifiedAt: new Date().toISOString(),
      };
      db.users.push(user);
    }

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بحساب Facebook بنجاح.',
      data: {
        user,
        accessToken: `token_user_${user.id}`,
        refreshToken: `refresh_user_${user.id}`,
      },
    });
  }

  // 9. POST /api/v1/products (Admin)
  if (path === 'products') {
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      sku: body.sku,
      nameAr: body.nameAr,
      nameEn: body.nameEn,
      brand: body.brand || 'قصر العطور',
      descriptionAr: body.descriptionAr,
      scentNotes: body.scentNotes,
      gender: body.gender || 'UNISEX',
      scentFamily: body.scentFamily || 'ORIENTAL',
      categoryId: body.categoryId,
      published: true,
      archivedAt: null,
      codMode: body.codMode || 'INHERIT',
      variants: body.variants || [{ id: `v-${Date.now()}`, sizeMl: 50, priceEgp: 1000, stockQuantity: 20 }],
      images: body.images || [{ id: `i-${Date.now()}`, imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800', position: 1 }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.products.unshift(newProd);
    return NextResponse.json({ success: true, message: 'تم حفظ ونشر العطر بنجاح.', data: { product: newProd } });
  }

  // 10. POST /api/v1/admin/discount-codes
  if (path === 'admin/discount-codes') {
    const newCode = {
      id: `code-${Date.now()}`,
      ...body,
      timesUsed: 0,
      active: true,
    };
    db.discountCodes.unshift(newCode);
    return NextResponse.json({ success: true, message: 'تم تفعيل الكود بنجاح.', data: { discountCode: newCode } });
  }

  // 11. POST /api/v1/webhooks/paymob
  if (path === 'webhooks/paymob') {
    return NextResponse.json({ success: true, message: 'تم استلام الإشعار' });
  }

  return NextResponse.json({ success: false, message: 'Not Found' }, { status: 404 });
}

// PUT Handler
export async function PUT(req: NextRequest, { params }: { params: { route: string[] } }) {
  const parts = params.route;
  const path = parts.join('/');
  const body = await req.json().catch(() => ({}));
  const sessKey = getSessionKey(req);

  // 1. PUT /api/v1/cart/items/:id
  if (parts[0] === 'cart' && parts[1] === 'items' && parts.length === 3) {
    const itemId = parts[2];
    const { quantity } = body;
    let cartData = db.carts.get(sessKey) || { items: [], appliedDiscountCode: null };

    if (quantity === 0) {
      cartData.items = cartData.items.filter((i) => i.id !== itemId);
    } else {
      const item = cartData.items.find((i) => i.id !== itemId);
      if (item) item.quantity = quantity;
    }
    db.carts.set(sessKey, cartData);
    return NextResponse.json({ success: true, data: calculateCartTotals(cartData) });
  }

  // 2. PUT /api/v1/admin/payment-settings
  if (path === 'admin/payment-settings') {
    db.paymentSettings = { ...db.paymentSettings, ...body, updatedAt: new Date().toISOString() };
    return NextResponse.json({ success: true, message: 'تم تحديث الإعدادات', data: { settings: db.paymentSettings } });
  }

  // 3. PUT /api/v1/orders/:id/status
  if (parts[0] === 'orders' && parts[2] === 'status' && parts.length === 3) {
    const orderId = parts[1];
    const { status, notes, codCollected } = body;
    const order = db.orders.find((o) => o.id === orderId);

    if (order) {
      order.status = status;
      if (codCollected || status === 'DELIVERED') {
        order.codCollectedAt = new Date().toISOString();
      }
      order.statusHistory.push({
        id: `h-${Date.now()}`,
        orderId,
        toStatus: status,
        changedBy: 'admin',
        notes: notes || null,
        changedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, message: 'تم تحديث حالة الطلب بنجاح.' });
  }

  return NextResponse.json({ success: false, message: 'Not Found' }, { status: 404 });
}

// DELETE Handler
export async function DELETE(req: NextRequest, { params }: { params: { route: string[] } }) {
  const parts = params.route;
  const sessKey = getSessionKey(req);

  // 1. DELETE /api/v1/cart/items/:id
  if (parts[0] === 'cart' && parts[1] === 'items' && parts.length === 3) {
    const itemId = parts[2];
    let cartData = db.carts.get(sessKey) || { items: [], appliedDiscountCode: null };
    cartData.items = cartData.items.filter((i) => i.id !== itemId);
    db.carts.set(sessKey, cartData);
    return NextResponse.json({ success: true, data: calculateCartTotals(cartData) });
  }

  // 2. DELETE /api/v1/products/:id (Archive)
  if (parts[0] === 'products' && parts.length === 2) {
    const prod = db.products.find((p) => p.id === parts[1]);
    if (prod) {
      prod.archivedAt = new Date().toISOString();
      prod.published = false;
    }
    return NextResponse.json({ success: true, message: 'تمت أرشفة المنتج.' });
  }

  return NextResponse.json({ success: false, message: 'Not Found' }, { status: 404 });
}

// Helper to calculate cart totals and join product variant data
function calculateCartTotals(cartData: { items: Array<{ id: string; variantId: string; quantity: number }>; appliedDiscountCode?: string | null }) {
  let subtotalEgp = 0;
  let discountEgp = 0;

  const populatedItems = cartData.items.map((cartItem) => {
    let matchedVariant: any = null;
    let matchedProduct: any = null;

    for (const prod of db.products) {
      const v = prod.variants.find((variant) => variant.id === cartItem.variantId);
      if (v) {
        matchedVariant = v;
        matchedProduct = prod;
        break;
      }
    }

    if (!matchedVariant) {
      matchedVariant = { id: cartItem.variantId, sizeMl: 50, priceEgp: 1000, stockQuantity: 20 };
      matchedProduct = db.products[0];
    }

    subtotalEgp += matchedVariant.priceEgp * cartItem.quantity;

    return {
      id: cartItem.id,
      cartId: 'cart-1',
      variantId: cartItem.variantId,
      quantity: cartItem.quantity,
      variant: {
        ...matchedVariant,
        product: matchedProduct,
      },
    };
  });

  if (cartData.appliedDiscountCode) {
    const code = db.discountCodes.find((c) => c.code === cartData.appliedDiscountCode);
    if (code && code.active) {
      if (code.type === 'PERCENT') {
        discountEgp = (subtotalEgp * code.value) / 100;
      } else {
        discountEgp = code.value;
      }
    }
  }

  const shippingFeeEgp = subtotalEgp >= 1000 ? 0 : 50;
  const totalEgp = Math.max(0, subtotalEgp - discountEgp + shippingFeeEgp);

  return {
    items: populatedItems,
    appliedDiscountCode: cartData.appliedDiscountCode || null,
    subtotalEgp,
    discountEgp,
    shippingFeeEgp,
    totalEgp,
  };
}

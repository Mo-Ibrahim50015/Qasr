import { Category, Product, Order, User, PaymentSettings } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', slug: 'oud', nameAr: 'العود الشرقي', nameEn: 'Royal Oud', displayPosition: 1, published: true, imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800', description: 'أندر وأفخم أنواع العود الكمبودي واللاوسي المعتق', productCount: 4 },
  { id: 'cat-2', slug: 'musk', nameAr: 'المسك الملكي', nameEn: 'Pure Musk', displayPosition: 2, published: true, imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800', description: 'مسك الطهارة والمسك الأبيض بنقاء مخملي يدوم طويلاً', productCount: 3 },
  { id: 'cat-3', slug: 'amber', nameAr: 'العنبر الفاخر', nameEn: 'Precious Amber', displayPosition: 3, published: true, imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800', description: 'نفحات العنبر الرمادي والذهبي بلمسات دافئة وساحرة', productCount: 3 },
  { id: 'cat-4', slug: 'french-perfumes', nameAr: 'عطور فرنسية', nameEn: 'French Perfumes', displayPosition: 4, published: true, imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800', description: 'أرقى إبداعات العطور الفرنسية الكلاسيكية والحديثة', productCount: 4 },
  { id: 'cat-5', slug: 'oriental-blends', nameAr: 'خلطات شرقية خاصة', nameEn: 'Oriental Blends', displayPosition: 5, published: true, imageUrl: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=800', description: 'توليفات ملكية خاصة تجمع بين سحر الشرق وأناقة الحضور', productCount: 2 },
  { id: 'cat-6', slug: 'mens-luxury', nameAr: 'عطور رجالية فاخرة', nameEn: "Men's Luxury", displayPosition: 6, published: true, imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800', description: 'عطور ذات طابع قوي وجريء يعكس الهيبة والتميز', productCount: 3 },
  { id: 'cat-7', slug: 'womens-elegance', nameAr: 'عطور نسائية راقية', nameEn: "Women's Elegance", displayPosition: 7, published: true, imageUrl: 'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?q=80&w=800', description: 'باقات زهرية ومسكية تنبض بالأنوثة والجاذبية', productCount: 3 },
  { id: 'cat-8', slug: 'unisex-signature', nameAr: 'عطور للجنسين', nameEn: 'Unisex Signature', displayPosition: 8, published: true, imageUrl: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?q=80&w=800', description: 'تناغم فريد يناسب كافة الأذواق والمناسبات', productCount: 3 },
  { id: 'cat-9', slug: 'bukhoor-incense', nameAr: 'بخور ومباخر تراثية', nameEn: 'Bukhoor & Incense', displayPosition: 9, published: true, imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800', description: 'أعواد وبخور فاخر ومباخر مصممة بإتقان', productCount: 2 },
  { id: 'cat-10', slug: 'perfume-oils-attar', nameAr: 'دهن العود وزيوت عطرية', nameEn: 'Attar & Perfume Oils', displayPosition: 10, published: true, imageUrl: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=800', description: 'تولات دهن عود صافي وزيوت عطرية مركزة خالية من الكحول', productCount: 2 },
  { id: 'cat-11', slug: 'hair-mists', nameAr: 'معطرات الشعر', nameEn: 'Hair Mists', displayPosition: 11, published: true, imageUrl: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?q=80&w=800', description: 'رذاذ معطر للشعر غني بالفيتامينات ونفحات جذابة', productCount: 2 },
  { id: 'cat-12', slug: 'body-mists', nameAr: 'معطرات الجسم واللوشن', nameEn: 'Body Mists & Lotions', displayPosition: 12, published: true, imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=800', description: 'ترطيب وتعطير مخملي يدوم لساعات طويلة', productCount: 2 },
  { id: 'cat-13', slug: 'home-fragrance', nameAr: 'معطرات المفارش والمنازل', nameEn: 'Home Fragrance & Diffusers', displayPosition: 13, published: true, imageUrl: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?q=80&w=800', description: 'أجواء منزلية مفعمة بالفخامة والراحة', productCount: 2 },
  { id: 'cat-14', slug: 'summer-fresh', nameAr: 'عطور صيفية ومنعشة', nameEn: 'Summer & Fresh Scents', displayPosition: 14, published: true, imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800', description: 'حمضيات ونوتات بحرية منعشة تلائم الأجواء الصيفية بمصر', productCount: 2 },
  { id: 'cat-15', slug: 'winter-warm', nameAr: 'عطور شتوية ودافئة', nameEn: 'Winter & Warm Scents', displayPosition: 15, published: true, imageUrl: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=800', description: 'دفء الفانيليا والجلود والأخشاب لإطلالة شتوية مميزة', productCount: 2 },
  { id: 'cat-16', slug: 'wedding-bridal', nameAr: 'مجموعات العرائس والمناسبات', nameEn: 'Wedding & Bridal Sets', displayPosition: 16, published: true, imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800', description: 'باقات متكاملة من أرقى العطور وبودرة الجسم للمناسبات السعيدة', productCount: 1 },
  { id: 'cat-17', slug: 'gift-sets', nameAr: 'بوكسات وهدايا فاخرة', nameEn: 'Gift Sets & Boxes', displayPosition: 17, published: true, imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800', description: 'تغليف هدايا ملكي يليق بمن تحب مع إمكانية كتابة إهداء', productCount: 2 },
  { id: 'cat-18', slug: 'travel-minis', nameAr: 'عطور السفر والحجم المدمج', nameEn: 'Travel Minis & Pocket Sprays', displayPosition: 18, published: true, imageUrl: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=800', description: 'عبوات أنيقة بحجم الجيب والسفر تلائم تنقلاتك اليومية', productCount: 2 },
  { id: 'cat-19', slug: 'niche-collection', nameAr: 'المجموعة الخاصة والنيش', nameEn: 'Niche & Private Collection', displayPosition: 19, published: true, imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800', description: 'إصدارات نادرة ومحدودة مخصصة لعشاق التميز والانفراد', productCount: 2 },
  { id: 'cat-20', slug: 'best-sellers', nameAr: 'الأكثر مبيعاً والوصل حديثاً', nameEn: 'Best Sellers & New Arrivals', displayPosition: 20, published: true, imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800', description: 'العطور الأكثر طلباً ونالت إعجاب عملائنا في مصر', productCount: 4 }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'QASR-OUD-001',
    nameAr: 'عود ملوكي معتق فاخر',
    nameEn: 'Royal Oud Malaki',
    brand: 'قصر العطور',
    descriptionAr: 'عطر شرقي أصيل مستخلص من أجود أنواع العود الكمبودي المعتق، ممزوج بنفحات العنبر والمسك النقي لإطلالة ساحرة وفخامة لا تضاهى.',
    descriptionEn: 'Authentic royal oriental fragrance crafted from vintage Cambodian agarwood, infused with amber and pure musk.',
    scentNotes: 'القمة: زعفران كشميري، فلفل وردي | القلب: عود كمبودي، خشب الأرز | القاعدة: عنبر رمادي، جلد فاخر، مسك',
    gender: 'UNISEX',
    scentFamily: 'OUD',
    categoryId: 'cat-1',
    published: true,
    archivedAt: null,
    codMode: 'INHERIT',
    variants: [
      { id: 'var-1-50', productId: 'prod-1', sizeMl: 50, priceEgp: 1450, stockQuantity: 30, skuVariant: 'QASR-OUD-001-50' },
      { id: 'var-1-100', productId: 'prod-1', sizeMl: 100, priceEgp: 2400, stockQuantity: 50, skuVariant: 'QASR-OUD-001-100' }
    ],
    images: [
      { id: 'img-1', productId: 'prod-1', r2Key: 'p1.jpg', imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800', position: 1 },
      { id: 'img-1b', productId: 'prod-1', r2Key: 'p1b.jpg', imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800', position: 2 }
    ],
    authenticityStatement: 'نضمن في قصر العطور أصالة ونقاء جميع منتجاتنا العطرية بنسبة 100%. تم استخلاص وتعتيق المكونات وفق أعلى المعايير الملكية مع شهادة ضمان الجودة والمصدر.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    sku: 'QASR-MUSK-002',
    nameAr: 'مسك الطهارة الأبيض النقي',
    nameEn: 'Pure White Musk',
    brand: 'قصر العطور',
    descriptionAr: 'مسك نقي بارد ومنعش يمنحك شعوراً فائقاً بالنقاء والانتعاش يدوم طوال اليوم.',
    descriptionEn: 'Crisp, velvety white musk providing long-lasting freshness and pure luxury.',
    scentNotes: 'القمة: زنبق الوادي، أزهار بيضاء | القلب: بودرة المسك، ياسمين | القاعدة: مسك أبيض خالص، صندل ناعم',
    gender: 'UNISEX',
    scentFamily: 'MUSK',
    categoryId: 'cat-2',
    published: true,
    archivedAt: null,
    codMode: 'INHERIT',
    variants: [
      { id: 'var-2-50', productId: 'prod-2', sizeMl: 50, priceEgp: 750, stockQuantity: 45, skuVariant: 'QASR-MUSK-002-50' },
      { id: 'var-2-100', productId: 'prod-2', sizeMl: 100, priceEgp: 1200, stockQuantity: 60, skuVariant: 'QASR-MUSK-002-100' }
    ],
    images: [
      { id: 'img-2', productId: 'prod-2', r2Key: 'p2.jpg', imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800', position: 1 }
    ],
    authenticityStatement: 'مسك طبيعي 100% خالٍ من أي مواد كيميائية ضارة ومطابق للمواصفات القياسية.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    sku: 'QASR-AMBER-003',
    nameAr: 'عنبر نايت الإمبراطوري',
    nameEn: 'Imperial Amber Night',
    brand: 'قصر العطور',
    descriptionAr: 'توليفة ساحرة من العنبر الدافئ مع خشب الصندل والفانيليا البوربون، لعشاق الفخامة والتميز في الأمسيات الخاصة.',
    descriptionEn: 'Opulent amber blended with creamy sandalwood and Madagascar bourbon vanilla.',
    scentNotes: 'القمة: برغموت إيطالي، لبان حوجري | القلب: عنبر ذهبي، قرفة سيلانية | القاعدة: فانيليا، باتشولي، خشب الصندل',
    gender: 'UNISEX',
    scentFamily: 'AMBER',
    categoryId: 'cat-3',
    published: true,
    archivedAt: null,
    codMode: 'INHERIT',
    variants: [
      { id: 'var-3-50', productId: 'prod-3', sizeMl: 50, priceEgp: 1350, stockQuantity: 25, skuVariant: 'QASR-AMBER-003-50' },
      { id: 'var-3-100', productId: 'prod-3', sizeMl: 100, priceEgp: 2150, stockQuantity: 35, skuVariant: 'QASR-AMBER-003-100' }
    ],
    images: [
      { id: 'img-3', productId: 'prod-3', r2Key: 'p3.jpg', imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800', position: 1 }
    ],
    authenticityStatement: 'عنبر مستخلص طبيعياً بأعلى تركيز وثبات يدوم لأكثر من 48 ساعة.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-4',
    sku: 'QASR-FRENCH-004',
    nameAr: 'إكسير الباريسي الأسود',
    nameEn: 'Parisian Black Elixir',
    brand: 'قصر العطور',
    descriptionAr: 'عطر فرنسي أرستقراطي بلمسات شرقية متوازنة يمنحك هيبة وجاذبية ملفتة في كل مكان.',
    descriptionEn: 'Aristocratic French blend merging delicate floral nuances with deep woods and spice.',
    scentNotes: 'القمة: هيل غواتيمالي، جريب فروت | القلب: خزامى فرنسية، جوزة الطيب | القاعدة: نجيل الهند، عنبر، لبان',
    gender: 'MEN',
    scentFamily: 'SPICY',
    categoryId: 'cat-4',
    published: true,
    archivedAt: null,
    codMode: 'INHERIT',
    variants: [
      { id: 'var-4-50', productId: 'prod-4', sizeMl: 50, priceEgp: 1100, stockQuantity: 40, skuVariant: 'QASR-FRENCH-004-50' },
      { id: 'var-4-100', productId: 'prod-4', sizeMl: 100, priceEgp: 1850, stockQuantity: 50, skuVariant: 'QASR-FRENCH-004-100' }
    ],
    images: [
      { id: 'img-4', productId: 'prod-4', r2Key: 'p4.jpg', imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800', position: 1 }
    ],
    authenticityStatement: 'زيوت فرنسية نقية 100% معبأة ومختومة وفق أعلى معايير الجودة العالمية.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

class MemoryDatabase {
  categories: Category[] = [...INITIAL_CATEGORIES];
  products: Product[] = [...INITIAL_PRODUCTS];
  users: User[] = [
    {
      id: 'admin-user-1',
      fullName: 'Mohamed Ibrahim (Admin)',
      email: 'mohammedibrahim50015@gmail.com',
      phone: '01098108123',
      password: 'Mohamed@5000',
      role: 'ADMIN',
      verifiedAt: new Date().toISOString()
    }
  ];
  discountCodes = [
    {
      id: 'code-1',
      code: 'QASR10',
      type: 'PERCENT',
      value: 10,
      startsAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      endsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      usageLimit: 500,
      timesUsed: 3,
      active: true,
      productIds: ['prod-1', 'prod-3']
    }
  ];
  paymentSettings: PaymentSettings = {
    id: 'default',
    codEnabledGlobal: true,
    codMaxOrderEgp: 10000,
    updatedBy: 'system',
    updatedAt: new Date().toISOString()
  };
  carts: Map<string, { items: Array<{ id: string; variantId: string; quantity: number }>; appliedDiscountCode?: string | null }> = new Map();
  orders: Order[] = [
    {
      id: 'ord-init-1',
      orderNumber: 'QA-20261012-1089',
      userId: 'admin-user-1',
      status: 'DELIVERED',
      paymentMethod: 'COD',
      subtotalEgp: 1450,
      discountEgp: 0,
      shippingFeeEgp: 0,
      totalEgp: 1450,
      shippingAddress: {
        fullName: 'أحمد محمود',
        phone: '01098765432',
        governorate: 'القاهرة',
        city: 'المعادي',
        addressDetails: 'شارع 9، عمارة 24، الدور الثالث'
      },
      codCollectedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        {
          id: 'item-1',
          orderId: 'ord-init-1',
          variantId: 'var-1-50',
          productNameSnapshot: 'عود ملوكي معتق فاخر (50 مل)',
          sizeMlSnapshot: 50,
          unitPriceEgp: 1450,
          quantity: 1
        }
      ],
      statusHistory: [
        { id: 'h-1', orderId: 'ord-init-1', toStatus: 'CONFIRMED', changedBy: 'system', changedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString() },
        { id: 'h-2', orderId: 'ord-init-1', toStatus: 'PREPARING', changedBy: 'admin', changedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString() },
        { id: 'h-3', orderId: 'ord-init-1', toStatus: 'SHIPPED', changedBy: 'admin', changedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
        { id: 'h-4', orderId: 'ord-init-1', toStatus: 'DELIVERED', changedBy: 'admin', notes: 'تم استلام المبلغ نقداً', changedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString() }
      ]
    }
  ];
}

// Global singleton for Next.js hot-reloads
declare global {
  // eslint-disable-next-line no-var
  var memoryDb: MemoryDatabase | undefined;
}

export const db = global.memoryDb || (global.memoryDb = new MemoryDatabase());

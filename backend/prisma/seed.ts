import { PrismaClient, Role, Gender, ScentFamily, CodMode, DiscountType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const CATEGORIES_SEED = [
  { slug: 'oud', nameAr: 'العود الشرقي', nameEn: 'Royal Oud', displayPosition: 1, imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800' },
  { slug: 'musk', nameAr: 'المسك الملكي', nameEn: 'Pure Musk', displayPosition: 2, imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800' },
  { slug: 'amber', nameAr: 'العنبر الفاخر', nameEn: 'Precious Amber', displayPosition: 3, imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800' },
  { slug: 'french-perfumes', nameAr: 'عطور فرنسية', nameEn: 'French Perfumes', displayPosition: 4, imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800' },
  { slug: 'oriental-blends', nameAr: 'خلطات شرقية خاصة', nameEn: 'Oriental Blends', displayPosition: 5, imageUrl: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=800' },
  { slug: 'mens-luxury', nameAr: 'عطور رجالية فاخرة', nameEn: "Men's Luxury", displayPosition: 6, imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800' },
  { slug: 'womens-elegance', nameAr: 'عطور نسائية راقية', nameEn: "Women's Elegance", displayPosition: 7, imageUrl: 'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?q=80&w=800' },
  { slug: 'unisex-signature', nameAr: 'عطور للجنسين', nameEn: 'Unisex Signature', displayPosition: 8, imageUrl: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?q=80&w=800' },
  { slug: 'bukhoor-incense', nameAr: 'بخور ومباخر تراثية', nameEn: 'Bukhoor & Incense', displayPosition: 9, imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800' },
  { slug: 'perfume-oils-attar', nameAr: 'دهن العود وزيوت عطرية', nameEn: 'Attar & Perfume Oils', displayPosition: 10, imageUrl: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=800' },
  { slug: 'hair-mists', nameAr: 'معطرات الشعر', nameEn: 'Hair Mists', displayPosition: 11, imageUrl: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?q=80&w=800' },
  { slug: 'body-mists', nameAr: 'معطرات الجسم واللوشن', nameEn: 'Body Mists & Lotions', displayPosition: 12, imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=800' },
  { slug: 'home-fragrance', nameAr: 'معطرات المفارش والمنازل', nameEn: 'Home Fragrance & Diffusers', displayPosition: 13, imageUrl: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?q=80&w=800' },
  { slug: 'summer-fresh', nameAr: 'عطور صيفية ومنعشة', nameEn: 'Summer & Fresh Scents', displayPosition: 14, imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800' },
  { slug: 'winter-warm', nameAr: 'عطور شتوية ودافئة', nameEn: 'Winter & Warm Scents', displayPosition: 15, imageUrl: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=800' },
  { slug: 'wedding-bridal', nameAr: 'مجموعات العرائس والمناسبات', nameEn: 'Wedding & Bridal Sets', displayPosition: 16, imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800' },
  { slug: 'gift-sets', nameAr: 'بوكسات وهدايا فاخرة', nameEn: 'Gift Sets & Boxes', displayPosition: 17, imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800' },
  { slug: 'travel-minis', nameAr: 'عطور السفر والحجم المدمج', nameEn: 'Travel Minis & Pocket Sprays', displayPosition: 18, imageUrl: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=800' },
  { slug: 'niche-collection', nameAr: 'المجموعة الخاصة والنيش', nameEn: 'Niche & Private Collection', displayPosition: 19, imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800' },
  { slug: 'best-sellers', nameAr: 'الأكثر مبيعاً والوصل حديثاً', nameEn: 'Best Sellers & New Arrivals', displayPosition: 20, imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800' }
];

async function main() {
  console.log('--- Starting Qasr Al Otoor Database Seeding ---');

  // 1. Payment Settings
  await prisma.paymentSettings.upsert({
    where: { id: 'default' },
    update: {
      codEnabledGlobal: true,
      codMaxOrderEgp: 10000,
    },
    create: {
      id: 'default',
      codEnabledGlobal: true,
      codMaxOrderEgp: 10000,
      updatedBy: 'system',
    },
  });
  console.log('Payment settings initialized.');

  // 2. Admin User
  const passwordHash = await bcrypt.hash('Mohamed@5000', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@qasralotoor.com' },
    update: {
      fullName: 'Mohamed Ibrahim (Admin)',
      role: Role.ADMIN,
      verifiedAt: new Date(),
    },
    create: {
      fullName: 'Mohamed Ibrahim (Admin)',
      email: 'admin@qasralotoor.com',
      phone: '01000000001',
      passwordHash,
      role: Role.ADMIN,
      verifiedAt: new Date(),
    },
  });
  console.log('Admin user initialized:', admin.email);

  // 3. 20 Categories
  for (const cat of CATEGORIES_SEED) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        nameAr: cat.nameAr,
        nameEn: cat.nameEn,
        displayPosition: cat.displayPosition,
        imageUrl: cat.imageUrl,
        published: true,
      },
      create: {
        slug: cat.slug,
        nameAr: cat.nameAr,
        nameEn: cat.nameEn,
        displayPosition: cat.displayPosition,
        imageUrl: cat.imageUrl,
        published: true,
        description: `أرقى تشكيلة من ${cat.nameAr} من قصر العطور بأعلى معايير النقاء والأصالة`,
      },
    });
  }
  console.log(`Seeded ${CATEGORIES_SEED.length} homepage categories.`);

  // 4. Sample Products
  const oudCategory = await prisma.category.findUnique({ where: { slug: 'oud' } });
  const muskCategory = await prisma.category.findUnique({ where: { slug: 'musk' } });
  const amberCategory = await prisma.category.findUnique({ where: { slug: 'amber' } });
  const frenchCategory = await prisma.category.findUnique({ where: { slug: 'french-perfumes' } });

  if (oudCategory && muskCategory) {
    // Product 1: Oud Malaki
    const p1 = await prisma.product.upsert({
      where: { sku: 'QASR-OUD-001' },
      update: {},
      create: {
        sku: 'QASR-OUD-001',
        nameAr: 'عود ملوكي فاخر',
        nameEn: 'Royal Oud Malaki',
        brand: 'قصر العطور',
        descriptionAr: 'عطر شرقي أصيل مستخلص من أجود أنواع العود الكمبودي المعتق، ممزوج بنفحات العنبر والمسك النقي لإطلالة ساحرة وفخامة لا تضاهى.',
        descriptionEn: 'Authentic royal oriental fragrance crafted from vintage Cambodian agarwood, infused with amber and pure musk.',
        scentNotes: 'القمة: زعفران كشميري، فلفل وردي | القلب: عود كمبودي، خشب الأرز | القاعدة: عنبر رمادي، جلد فاخر، مسك',
        gender: Gender.UNISEX,
        scentFamily: ScentFamily.OUD,
        categoryId: oudCategory.id,
        published: true,
        codMode: CodMode.INHERIT,
        variants: {
          create: [
            { sizeMl: 50, priceEgp: 1450, stockQuantity: 30, skuVariant: 'QASR-OUD-001-50' },
            { sizeMl: 100, priceEgp: 2400, stockQuantity: 50, skuVariant: 'QASR-OUD-001-100' },
          ],
        },
        images: {
          create: [
            {
              r2Key: 'products/oud-malaki-1.jpg',
              imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800',
              position: 1,
            },
            {
              r2Key: 'products/oud-malaki-2.jpg',
              imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800',
              position: 2,
            },
          ],
        },
      },
    });

    // Product 2: Musk Tahara
    const p2 = await prisma.product.upsert({
      where: { sku: 'QASR-MUSK-002' },
      update: {},
      create: {
        sku: 'QASR-MUSK-002',
        nameAr: 'مسك الطهارة الأبيض',
        nameEn: 'Pure White Musk',
        brand: 'قصر العطور',
        descriptionAr: 'مسك نقي بارد ومنعش يمنحك شعوراً فائقاً بالنقاء والانتعاش يدوم طوال اليوم.',
        descriptionEn: 'Crisp, velvety white musk providing long-lasting freshness and pure luxury.',
        scentNotes: 'القمة: زنبق الوادي، أزهار بيضاء | القلب: بودرة المسك، ياسمين | القاعدة: مسك أبيض خالص، صندل ناعم',
        gender: Gender.UNISEX,
        scentFamily: ScentFamily.MUSK,
        categoryId: muskCategory.id,
        published: true,
        codMode: CodMode.INHERIT,
        variants: {
          create: [
            { sizeMl: 50, priceEgp: 750, stockQuantity: 40, skuVariant: 'QASR-MUSK-002-50' },
            { sizeMl: 100, priceEgp: 1200, stockQuantity: 60, skuVariant: 'QASR-MUSK-002-100' },
          ],
        },
        images: {
          create: [
            {
              r2Key: 'products/musk-tahara-1.jpg',
              imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800',
              position: 1,
            },
          ],
        },
      },
    });

    // 5. Product-specific discount code (PRD P0-F010)
    const code = await prisma.discountCode.upsert({
      where: { code: 'QASR10' },
      update: {},
      create: {
        code: 'QASR10',
        type: DiscountType.PERCENT,
        value: 10, // 10%
        startsAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        usageLimit: 500,
        timesUsed: 0,
        active: true,
        products: {
          create: [
            { productId: p1.id },
          ],
        },
      },
    });
    console.log('Sample discount code initialized:', code.code);
  }

  console.log('--- Database Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


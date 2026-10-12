import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { validateRequest } from '../middleware/validate';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { Gender, ScentFamily, CodMode, Prisma } from '@prisma/client';

const router = Router();

// Validation Schemas
const variantSchema = z.object({
  id: z.string().optional(),
  sizeMl: z.number().int().positive('حجم العبوة بالمل مطلوب'),
  priceEgp: z.number().positive('السعر بالجنيه المصري مطلوب'),
  stockQuantity: z.number().int().nonnegative('الكمية يجب أن تكون صفراً أو أكثر'),
  skuVariant: z.string().optional(),
});

const imageSchema = z.object({
  id: z.string().optional(),
  imageUrl: z.string().url('رابط الصورة مطلوب'),
  r2Key: z.string().default(''),
  position: z.number().int().min(1).max(8).default(1),
});

const createProductSchema = z.object({
  sku: z.string().min(3, 'رمز SKU مطلوب (3 أحرف على الأقل)'),
  nameAr: z.string().min(2, 'الاسم بالعربية مطلوب'),
  nameEn: z.string().min(2, 'الاسم بالإنجليزية مطلوب'),
  brand: z.string().default('قصر العطور'),
  descriptionAr: z.string().min(10, 'الوصف بالعربية مطلوب'),
  descriptionEn: z.string().optional(),
  scentNotes: z.string().min(3, 'الهرم العطري والملاحظات مطلوبة'),
  gender: z.nativeEnum(Gender).default(Gender.UNISEX),
  scentFamily: z.nativeEnum(ScentFamily).default(ScentFamily.ORIENTAL),
  categoryId: z.string().uuid('معرف القسم غير صحيح'),
  published: z.boolean().default(true),
  codMode: z.nativeEnum(CodMode).default(CodMode.INHERIT),
  variants: z.array(variantSchema).min(1, 'يجب إضافة حجم وسعر واحد على الأقل'),
  images: z.array(imageSchema).min(1, 'يجب إضافة صورة واحدة على الأقل').max(8, 'الحد الأقصى للصور 8 صور'),
});

// GET /api/v1/products - List products with filtering, sorting, pagination, and search
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = 24; // Exactly 24 products per page per PRD P0-F004
    const skip = (page - 1) * limit;

    const {
      categorySlug,
      categoryId,
      minPrice,
      maxPrice,
      gender,
      scentFamily,
      inStock,
      sort,
      search,
    } = req.query;

    const where: Prisma.ProductWhereInput = {
      published: true,
      archivedAt: null,
    };

    if (categorySlug) {
      where.category = { slug: String(categorySlug) };
    } else if (categoryId) {
      where.categoryId = String(categoryId);
    }

    if (gender && Object.values(Gender).includes(gender as Gender)) {
      where.gender = gender as Gender;
    }

    if (scentFamily && Object.values(ScentFamily).includes(scentFamily as ScentFamily)) {
      where.scentFamily = scentFamily as ScentFamily;
    }

    // Search by name, brand, scent notes (P1-F001)
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const q = search.trim();
      where.OR = [
        { nameAr: { contains: q, mode: 'insensitive' } },
        { nameEn: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { scentNotes: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Filter by variant price and in-stock
    const variantWhere: Prisma.ProductVariantWhereInput = {};
    if (minPrice || maxPrice) {
      variantWhere.priceEgp = {};
      if (minPrice) variantWhere.priceEgp.gte = parseFloat(minPrice as string);
      if (maxPrice) variantWhere.priceEgp.lte = parseFloat(maxPrice as string);
    }

    if (inStock === 'true') {
      variantWhere.stockQuantity = { gt: 0 };
    }

    if (Object.keys(variantWhere).length > 0) {
      where.variants = { some: variantWhere };
    }

    // Sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: { id: true, nameAr: true, nameEn: true, slug: true },
          },
          variants: {
            orderBy: { priceEgp: 'asc' },
          },
          images: {
            orderBy: { position: 'asc' },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Client/Sort mapping for price if needed
    let sortedProducts = products;
    if (sort === 'price_asc') {
      sortedProducts = [...products].sort((a, b) => (a.variants[0]?.priceEgp || 0) - (b.variants[0]?.priceEgp || 0));
    } else if (sort === 'price_desc') {
      sortedProducts = [...products].sort((a, b) => (b.variants[0]?.priceEgp || 0) - (a.variants[0]?.priceEgp || 0));
    }

    res.json({
      success: true,
      data: {
        products: sortedProducts,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: page * limit < totalCount,
        },
      },
    });
  } catch (error: any) {
    console.error('List products error:', error);
    res.status(500).json({ success: false, message: 'فشل استرجاع قائمة المنتجات' });
  }
});

// GET /api/v1/products/:id - Product Detail (PRD P0-F005)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          orderBy: { sizeMl: 'asc' },
        },
        images: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!product || product.archivedAt) {
      return res.status(404).json({
        success: false,
        message: 'هذا المنتج لم يعد متوفراً.',
      });
    }

    // Authenticity statement included per PRD P0-F005
    const authenticityStatement =
      'نضمن في قصر العطور أصالة ونقاء جميع منتجاتنا العطرية بنسبة 100%. تم استخلاص وتعتيق المكونات وفق أعلى المعايير الملكية مع شهادة ضمان الجودة والمصدر.';

    res.json({
      success: true,
      data: {
        product: {
          ...product,
          authenticityStatement,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل تحميل بيانات المنتج' });
  }
});

// ADMIN ROUTES (PRD P0-F009)

// GET /api/v1/products/admin/all - Admin product listing with full filters
router.get('/admin/all', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = 50;
    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          variants: true,
          images: true,
        },
      }),
      prisma.product.count(),
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل جلب المنتجات للمدير' });
  }
});

// POST /api/v1/products - Create Product (Admin)
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  validateRequest(createProductSchema),
  async (req: Request, res: Response) => {
    try {
      // 1. Catalog capacity limit check (PRD Section 4 & 7: max 1,000 products)
      const currentCount = await prisma.product.count({ where: { archivedAt: null } });
      if (currentCount >= 1000) {
        return res.status(400).json({
          success: false,
          message: 'تم الوصول للحد الأقصى لعدد المنتجات في الكتالوج (1000 منتج).',
        });
      }

      const { variants, images, ...productData } = req.body;

      // 2. Check duplicate SKU
      const existingSku = await prisma.product.findUnique({ where: { sku: productData.sku } });
      if (existingSku) {
        return res.status(409).json({
          success: false,
          message: 'يوجد منتج مسجل برمز SKU هذا بالفعل.',
        });
      }

      // 3. Create product with variants and images
      const product = await prisma.product.create({
        data: {
          ...productData,
          variants: {
            create: variants.map((v: any) => ({
              sizeMl: v.sizeMl,
              priceEgp: v.priceEgp,
              stockQuantity: v.stockQuantity,
              skuVariant: v.skuVariant || `${productData.sku}-${v.sizeMl}`,
            })),
          },
          images: {
            create: images.map((img: any, idx: number) => ({
              imageUrl: img.imageUrl,
              r2Key: img.r2Key || `products/${productData.sku}-${idx + 1}.jpg`,
              position: img.position || idx + 1,
            })),
          },
        },
        include: {
          variants: true,
          images: true,
          category: true,
        },
      });

      res.status(201).json({
        success: true,
        message: 'تم حفظ المنتج بنجاح.',
        data: { product },
      });
    } catch (error: any) {
      console.error('Create product error:', error);
      res.status(500).json({ success: false, message: 'فشل حفظ المنتج الجديد' });
    }
  }
);

// PUT /api/v1/products/:id - Update Product (Admin)
router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  validateRequest(createProductSchema.partial()),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { variants, images, ...productData } = req.body;

      // Update core product fields
      const product = await prisma.$transaction(async (tx) => {
        const updated = await tx.product.update({
          where: { id },
          data: productData,
        });

        // If variants supplied, recreate or sync
        if (variants && Array.isArray(variants)) {
          await tx.productVariant.deleteMany({ where: { productId: id } });
          await tx.productVariant.createMany({
            data: variants.map((v: any) => ({
              productId: id,
              sizeMl: v.sizeMl,
              priceEgp: v.priceEgp,
              stockQuantity: v.stockQuantity,
              skuVariant: v.skuVariant || `${updated.sku}-${v.sizeMl}`,
            })),
          });
        }

        // If images supplied, recreate or sync
        if (images && Array.isArray(images)) {
          await tx.productImage.deleteMany({ where: { productId: id } });
          await tx.productImage.createMany({
            data: images.map((img: any, idx: number) => ({
              productId: id,
              imageUrl: img.imageUrl,
              r2Key: img.r2Key || `products/${updated.sku}-${idx + 1}.jpg`,
              position: img.position || idx + 1,
            })),
          });
        }

        return tx.product.findUnique({
          where: { id },
          include: { variants: true, images: true, category: true },
        });
      });

      res.json({
        success: true,
        message: 'تم تحديث بيانات المنتج بنجاح.',
        data: { product },
      });
    } catch (error: any) {
      console.error('Update product error:', error);
      res.status(500).json({ success: false, message: 'فشل تحديث المنتج' });
    }
  }
);

// DELETE /api/v1/products/:id - Archive Product (Soft delete per PRD P0-F009)
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.update({
      where: { id },
      data: {
        archivedAt: new Date(),
        published: false,
      },
    });

    res.json({
      success: true,
      message: 'تم أرشفة المنتج وإخفاؤه من واجهة المتجر بنجاح.',
      data: { product },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل أرشفة المنتج' });
  }
});

export default router;


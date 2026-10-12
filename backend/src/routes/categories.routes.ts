import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { validateRequest } from '../middleware/validate';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

const categorySchema = z.object({
  nameAr: z.string().min(2, 'الاسم بالعربية مطلوب'),
  nameEn: z.string().min(2, 'الاسم بالإنجليزية مطلوب'),
  slug: z.string().min(2, 'الرابط التعريفي slug مطلوب'),
  displayPosition: z.number().int().min(1).default(1),
  published: z.boolean().default(true),
  imageUrl: z.string().url('رابط الصورة غير صحيح').optional().or(z.literal('')),
  description: z.string().optional(),
});

// GET /api/v1/categories - List published homepage categories (up to 20 per PRD P0-F003)
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { published: true },
      orderBy: { displayPosition: 'asc' },
      take: 20,
      include: {
        _count: {
          select: {
            products: {
              where: {
                published: true,
                archivedAt: null,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        categories: categories.map((cat) => ({
          id: cat.id,
          nameAr: cat.nameAr,
          nameEn: cat.nameEn,
          slug: cat.slug,
          displayPosition: cat.displayPosition,
          imageUrl: cat.imageUrl,
          description: cat.description,
          productCount: cat._count.products,
        })),
      },
    });
  } catch (error: any) {
    console.error('List categories error:', error);
    res.status(500).json({ success: false, message: 'فشل تحميل الأقسام' });
  }
});

// GET /api/v1/categories/:slug - Category details
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            products: {
              where: { published: true, archivedAt: null },
            },
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'القسم غير موجود' });
    }

    res.json({
      success: true,
      data: { category },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل استرجاع بيانات القسم' });
  }
});

// ADMIN ROUTES

// GET /api/v1/categories/admin/all - List all categories for Admin
router.get('/admin/all', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayPosition: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    res.json({ success: true, data: { categories } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل جلب الأقسام' });
  }
});

// POST /api/v1/categories - Create Category (Admin)
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  validateRequest(categorySchema),
  async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'هذا الرابط التعريفي (slug) مستخدم بالفعل' });
      }

      const category = await prisma.category.create({ data });
      res.status(201).json({
        success: true,
        message: 'تم إضافة القسم بنجاح',
        data: { category },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'فشل إضافة القسم' });
    }
  }
);

// PUT /api/v1/categories/:id - Update Category (Admin)
router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  validateRequest(categorySchema.partial()),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const category = await prisma.category.update({
        where: { id },
        data,
      });

      res.json({
        success: true,
        message: 'تم تحديث بيانات القسم بنجاح',
        data: { category },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'فشل تحديث القسم' });
    }
  }
);

export default router;


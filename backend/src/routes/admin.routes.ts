import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { DiscountType, CodMode, OrderStatus, PaymentMethod } from '@prisma/client';

const router = Router();

// Validation Schemas
const discountCodeSchema = z
  .object({
    code: z
      .string()
      .regex(/^[A-Z0-9]{4,20}$/, 'كود الخصم يجب أن يتكون من 4 إلى 20 حرفاً كبيراً وأرقاماً إنجليزية فقط دون مسافات أو رموز'),
    type: z.nativeEnum(DiscountType),
    value: z.number().positive('قيمة الخصم يجب أن تكون أكبر من صفر'),
    startsAt: z.string().or(z.date()),
    endsAt: z.string().or(z.date()),
    usageLimit: z.number().int().positive('حد الاستخدام يجب أن يكون 1 على الأقل').default(100),
    active: z.boolean().default(true),
    productIds: z.array(z.string().uuid()).min(1, 'يجب ربط الكود بمنتج واحد على الأقل'),
  })
  .refine(
    (data) => {
      if (data.type === DiscountType.PERCENT) {
        return data.value >= 1 && data.value <= 100;
      }
      return true;
    },
    {
      message: 'نسبة الخصم المئوية يجب أن تكون بين 1% و 100%',
      path: ['value'],
    }
  )
  .refine(
    (data) => new Date(data.endsAt) > new Date(data.startsAt),
    {
      message: 'تاريخ انتهاء الكود يجب أن يكون بعد تاريخ البدء',
      path: ['endsAt'],
    }
  );

const paymentSettingsSchema = z.object({
  codEnabledGlobal: z.boolean(),
  codMaxOrderEgp: z.number().positive('الحد الأقصى يجب أن يكون رقماً موجباً').nullable().optional(),
});

// All routes here require Admin role
router.use(authenticateToken, requireAdmin);

// ==================== COD / PAYMENT SETTINGS (PRD P0-F011) ====================

// GET /api/v1/admin/payment-settings
router.get('/payment-settings', async (req: Request, res: Response) => {
  try {
    let settings = await prisma.paymentSettings.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = await prisma.paymentSettings.create({
        data: {
          id: 'default',
          codEnabledGlobal: true,
          codMaxOrderEgp: 10000,
          updatedBy: req.user!.id,
        },
      });
    }

    res.json({ success: true, data: { settings } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل تحميل إعدادات الدفع' });
  }
});

// PUT /api/v1/admin/payment-settings - Update COD configuration
router.put(
  '/payment-settings',
  validateRequest(paymentSettingsSchema),
  async (req: Request, res: Response) => {
    try {
      const { codEnabledGlobal, codMaxOrderEgp } = req.body;

      const settings = await prisma.paymentSettings.upsert({
        where: { id: 'default' },
        update: {
          codEnabledGlobal,
          codMaxOrderEgp: codMaxOrderEgp || null,
          updatedBy: req.user!.id,
        },
        create: {
          id: 'default',
          codEnabledGlobal,
          codMaxOrderEgp: codMaxOrderEgp || null,
          updatedBy: req.user!.id,
        },
      });

      res.json({
        success: true,
        message: 'تم تحديث إعدادات الدفع عند الاستلام بنجاح.',
        data: { settings },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'فشل حفظ إعدادات الدفع' });
    }
  }
);

// ==================== DISCOUNT CODES (PRD P0-F010) ====================

// GET /api/v1/admin/discount-codes - List all discount codes
router.get('/discount-codes', async (req: Request, res: Response) => {
  try {
    const codes = await prisma.discountCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        products: {
          include: {
            product: {
              select: { id: true, nameAr: true, nameEn: true, sku: true },
            },
          },
        },
      },
    });

    res.json({ success: true, data: { codes } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل جلب أكواد الخصم' });
  }
});

// POST /api/v1/admin/discount-codes - Create product discount code
router.post(
  '/discount-codes',
  validateRequest(discountCodeSchema),
  async (req: Request, res: Response) => {
    try {
      const { code, type, value, startsAt, endsAt, usageLimit, active, productIds } = req.body;

      // Check duplicate code (PRD Alternate Flow A1)
      const existing = await prisma.discountCode.findUnique({ where: { code } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'هذا الكود مسجل بالفعل، يرجى اختيار رمز آخر.',
        });
      }

      const discountCode = await prisma.discountCode.create({
        data: {
          code,
          type,
          value,
          startsAt: new Date(startsAt),
          endsAt: new Date(endsAt),
          usageLimit,
          active,
          products: {
            create: productIds.map((pId: string) => ({
              productId: pId,
            })),
          },
        },
        include: {
          products: {
            include: { product: true },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'تم إنشاء كود الخصم وربطه بالمنتجات المحددة بنجاح.',
        data: { discountCode },
      });
    } catch (error: any) {
      console.error('Create discount code error:', error);
      res.status(500).json({ success: false, message: 'فشل إنشاء كود الخصم' });
    }
  }
);

// PUT /api/v1/admin/discount-codes/:id - Update discount code
router.put('/discount-codes/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { active, usageLimit, endsAt } = req.body;

    const updated = await prisma.discountCode.update({
      where: { id },
      data: {
        ...(typeof active === 'boolean' && { active }),
        ...(usageLimit && { usageLimit: parseInt(usageLimit, 10) }),
        ...(endsAt && { endsAt: new Date(endsAt) }),
      },
    });

    res.json({
      success: true,
      message: 'تم تحديث كود الخصم بنجاح.',
      data: { discountCode: updated },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل تحديث كود الخصم' });
  }
});

// ==================== SALES STATISTICS (PRD P1-F005) ====================

// GET /api/v1/admin/stats - Sales statistics dashboard
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [
      totalOrders,
      confirmedOrPaidOrders,
      totalRevenueResult,
      codOrdersCount,
      paymobOrdersCount,
      productCount,
      customerCount,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: {
          status: { in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.SHIPPED, OrderStatus.DELIVERED] },
        },
      }),
      prisma.order.aggregate({
        where: {
          status: { in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.SHIPPED, OrderStatus.DELIVERED] },
        },
        _sum: { totalEgp: true },
      }),
      prisma.order.count({ where: { paymentMethod: PaymentMethod.COD } }),
      prisma.order.count({ where: { paymentMethod: PaymentMethod.PAYMOB } }),
      prisma.product.count({ where: { archivedAt: null } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { fullName: true, phone: true } } },
      }),
    ]);

    const totalRevenueEgp = totalRevenueResult._sum.totalEgp || 0;
    const averageOrderValueEgp = confirmedOrPaidOrders > 0 ? Math.round(totalRevenueEgp / confirmedOrPaidOrders) : 0;

    res.json({
      success: true,
      data: {
        metrics: {
          totalRevenueEgp,
          confirmedOrPaidOrders,
          totalOrders,
          averageOrderValueEgp,
          codOrdersCount,
          paymobOrdersCount,
          productCount,
          customerCount,
        },
        recentOrders,
      },
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'فشل جلب إحصائيات المبيعات' });
  }
});

export default router;


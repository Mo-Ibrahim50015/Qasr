import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { OrderStatus, PaymentMethod } from '@prisma/client';
import { notificationService } from '../services/notification.service';

const router = Router();

// Allowed status transitions state machine (PRD Section 7 P0-F012 Alternate Flow A1)
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  PREPARING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  SHIPPED: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  DELIVERED: [], // Terminal state
  CANCELLED: [], // Terminal state
};

const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, { errorMap: () => ({ message: 'حالة الطلب غير صالحة' }) }),
  notes: z.string().optional(),
  codCollected: z.boolean().optional(),
});

// GET /api/v1/orders - Customer's own orders list (PRD P0-F008)
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        statusHistory: {
          orderBy: { changedAt: 'asc' },
        },
      },
    });

    res.json({
      success: true,
      data: { orders },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل تحميل قائمة الطلبات' });
  }
});

// GET /api/v1/orders/:id - Customer Order Detail and Tracking Timeline (PRD P0-F008)
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { take: 1, orderBy: { position: 'asc' } },
                  },
                },
              },
            },
          },
        },
        statusHistory: {
          orderBy: { changedAt: 'asc' },
        },
      },
    });

    // Check ownership or admin: if not found or belongs to another customer -> HTTP 404 (PRD Alternate Flow A2)
    if (!order || (order.userId !== userId && req.user!.role !== 'ADMIN')) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود.',
      });
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل استرجاع تفاصيل الطلب' });
  }
});

// ADMIN ROUTES (PRD P0-F012)

// GET /api/v1/orders/admin/all - Admin list orders with filters
router.get('/admin/all', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = 50; // Loads 50 records per page in under 1 second per PRD P0-F012
    const skip = (page - 1) * limit;

    const { status, paymentMethod, search } = req.query;

    const where: any = {};
    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      where.status = status as OrderStatus;
    }
    if (paymentMethod && Object.values(PaymentMethod).includes(paymentMethod as PaymentMethod)) {
      where.paymentMethod = paymentMethod as PaymentMethod;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search } } },
      ];
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          items: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Admin list orders error:', error);
    res.status(500).json({ success: false, message: 'فشل تحميل طلبات الإدارة' });
  }
});

// PUT /api/v1/orders/:id/status - Admin update status with state transition check and COD recording
router.put(
  '/:id/status',
  authenticateToken,
  requireAdmin,
  validateRequest(updateStatusSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status: targetStatus, notes, codCollected } = req.body;
      const adminUserId = req.user!.id;

      const order = await prisma.order.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!order) {
        return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
      }

      // Check transition rules
      const currentStatus = order.status;
      if (currentStatus !== targetStatus) {
        const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
        if (!allowedNext.includes(targetStatus)) {
          return res.status(400).json({
            success: false,
            message: `غير مسموح بتغيير حالة الطلب من (${currentStatus}) إلى (${targetStatus}).`,
          });
        }
      }

      // Update order and append to statusHistory
      const updatedOrder = await prisma.$transaction(async (tx) => {
        const updateData: any = {
          status: targetStatus,
        };

        if (codCollected || (targetStatus === OrderStatus.DELIVERED && order.paymentMethod === PaymentMethod.COD)) {
          updateData.codCollectedAt = new Date();
        }

        const o = await tx.order.update({
          where: { id },
          data: updateData,
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            fromStatus: currentStatus,
            toStatus: targetStatus,
            changedBy: adminUserId,
            notes: notes || null,
          },
        });

        return o;
      });

      // Dispatch status notification to customer (PRD P0-F012 & P1-F002)
      const shippingInfo = order.shippingAddress as any;
      notificationService
        .sendOrderStatusUpdate({
          orderNumber: order.orderNumber,
          customerName: shippingInfo?.fullName || order.user.fullName,
          phone: shippingInfo?.phone || order.user.phone || '',
          email: order.user.email,
          status: targetStatus,
          notes,
        })
        .catch((err) => console.error('Failed to send status notification:', err));

      res.json({
        success: true,
        message: 'تم تحديث حالة الطلب بنجاح.',
        data: { order: updatedOrder },
      });
    } catch (error: any) {
      console.error('Update order status error:', error);
      res.status(500).json({ success: false, message: 'فشل تحديث حالة الطلب' });
    }
  }
);

export default router;


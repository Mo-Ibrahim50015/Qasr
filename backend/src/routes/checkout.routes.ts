import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { OtpService } from '../services/otp.service';
import { notificationService } from '../services/notification.service';
import { PaymobService } from '../services/paymob.service';
import { redis } from '../lib/redis';
import {
  PaymentMethod,
  OrderStatus,
  CodMode,
  DiscountType,
} from '@prisma/client';

const router = Router();

const checkoutSchema = z.object({
  idempotencyKey: z.string().min(5, 'مفتاح العملية idempotencyKey مطلوب لمنع تكرار الطلب'),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    errorMap: () => ({ message: 'طريقة الدفع غير صحيحة' }),
  }),
  shippingAddress: z.object({
    fullName: z.string().min(3, 'الاسم الكامل مطلوب'),
    phone: z.string().refine((val) => OtpService.isValidEgyptianPhone(val), {
      message: 'رقم الهاتف يجب أن يكون رقم مصري صالح (01X XXXXXXXX)',
    }),
    governorate: z.string().min(2, 'المحافظة مطلوبة'),
    city: z.string().min(2, 'المدينة / المنطقة مطلوبة'),
    addressDetails: z.string().min(5, 'تفاصيل العنوان واسم الشارع مطلوب'),
    notes: z.string().optional(),
  }),
});

// Helper to evaluate COD availability for cart items
async function checkCodEligibility(
  items: Array<{ variant: { product: { codMode: CodMode; nameAr: string } } }>,
  orderTotalEgp: number
): Promise<{ eligible: boolean; reason?: string }> {
  // 1. Check global payment settings
  const settings = await prisma.paymentSettings.findUnique({ where: { id: 'default' } });
  const globalEnabled = settings ? settings.codEnabledGlobal : true;

  if (!globalEnabled) {
    return {
      eligible: false,
      reason: 'خدمة الدفع عند الاستلام غير مفعلة حالياً.',
    };
  }

  // 2. Check COD max order value in EGP
  if (settings?.codMaxOrderEgp && orderTotalEgp > settings.codMaxOrderEgp) {
    return {
      eligible: false,
      reason: `الدفع عند الاستلام متاح للطلبات حتى ${settings.codMaxOrderEgp} ج.م فقط.`,
    };
  }

  // 3. Check each product's COD override
  for (const item of items) {
    const product = item.variant.product;
    if (product.codMode === CodMode.DISABLE) {
      return {
        eligible: false,
        reason: `الدفع عند الاستلام غير متاح للمنتج (${product.nameAr}) في سلتك.`,
      };
    }
  }

  return { eligible: true };
}

// Generate unique order number: QA-YYYYMMDD-XXXX
function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `QA-${dateStr}-${rand}`;
}

// POST /api/v1/checkout - Create Order (COD or Paymob)
router.post('/', authenticateToken, validateRequest(checkoutSchema), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { idempotencyKey, paymentMethod, shippingAddress } = req.body;

    // Idempotency check: prevent duplicate orders if double-clicked (PRD Section 11.2)
    const idempotencyLockKey = `idempotency:checkout:${userId}:${idempotencyKey}`;
    const alreadyProcessed = await redis.get(idempotencyLockKey);
    if (alreadyProcessed) {
      return res.status(409).json({
        success: false,
        message: 'جاري معالجة طلبك بالفعل، يرجى عدم الضغط مرتين.',
        data: { orderId: alreadyProcessed },
      });
    }

    // Lock for 60 seconds
    await redis.set(idempotencyLockKey, 'processing', 'EX', 60);

    // Fetch user and ensure verified
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || (!user.verifiedAt && user.role !== 'ADMIN')) {
      await redis.del(idempotencyLockKey);
      return res.status(403).json({
        success: false,
        message: 'يرجى تأكيد وتفعيل حسابك برمز التحقق أولاً قبل إتمام الطلب.',
      });
    }

    // Fetch active cart
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      await redis.del(idempotencyLockKey);
      return res.status(400).json({
        success: false,
        message: 'سلة التسوق فارغة.',
      });
    }

    // Verify stock availability
    for (const item of cart.items) {
      if (item.quantity > item.variant.stockQuantity) {
        await redis.del(idempotencyLockKey);
        return res.status(400).json({
          success: false,
          message: `عذراً، المنتج (${item.variant.product.nameAr} - ${item.variant.sizeMl} مل) الكمية المتاحة منه الآن هي ${item.variant.stockQuantity} فقط.`,
        });
      }
    }

    // Calculate subtotal
    let subtotalEgp = 0;
    for (const item of cart.items) {
      subtotalEgp += item.variant.priceEgp * item.quantity;
    }

    // Calculate discount
    let discountEgp = 0;
    let discountCodeRecord: any = null;

    if (cart.appliedDiscountCode) {
      discountCodeRecord = await prisma.discountCode.findUnique({
        where: { code: cart.appliedDiscountCode },
        include: { products: true },
      });

      if (
        discountCodeRecord &&
        discountCodeRecord.active &&
        new Date() >= discountCodeRecord.startsAt &&
        new Date() <= discountCodeRecord.endsAt &&
        discountCodeRecord.timesUsed < discountCodeRecord.usageLimit
      ) {
        const eligibleProductIds = new Set(discountCodeRecord.products.map((p: any) => p.productId));
        for (const item of cart.items) {
          if (eligibleProductIds.has(item.variant.productId)) {
            const itemTotal = item.variant.priceEgp * item.quantity;
            if (discountCodeRecord.type === DiscountType.PERCENT) {
              discountEgp += (itemTotal * discountCodeRecord.value) / 100;
            } else {
              discountEgp += Math.min(itemTotal, discountCodeRecord.value);
            }
          }
        }
      }
    }

    const shippingFeeEgp = subtotalEgp >= 1000 ? 0 : 50;
    const totalEgp = Math.max(0, subtotalEgp - discountEgp + shippingFeeEgp);

    // Validate COD eligibility
    if (paymentMethod === PaymentMethod.COD) {
      const codCheck = await checkCodEligibility(cart.items, totalEgp);
      if (!codCheck.eligible) {
        await redis.del(idempotencyLockKey);
        return res.status(400).json({
          success: false,
          message: codCheck.reason || 'الدفع عند الاستلام غير متاح لهذا الطلب.',
        });
      }
    }

    const orderNumber = generateOrderNumber();
    const initialStatus = paymentMethod === PaymentMethod.COD ? OrderStatus.CONFIRMED : OrderStatus.PENDING_PAYMENT;

    // Transaction: Create Order, Deduct Stock, Increment Discount Times Used, Clear Cart
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: initialStatus,
          paymentMethod,
          subtotalEgp,
          discountEgp,
          shippingFeeEgp,
          totalEgp,
          shippingAddress,
          items: {
            create: cart.items.map((item) => ({
              variantId: item.variantId,
              productNameSnapshot: `${item.variant.product.nameAr} (${item.variant.sizeMl} مل)`,
              sizeMlSnapshot: item.variant.sizeMl,
              unitPriceEgp: item.variant.priceEgp,
              quantity: item.quantity,
            })),
          },
          statusHistory: {
            create: {
              fromStatus: null,
              toStatus: initialStatus,
              changedBy: userId,
              notes: paymentMethod === PaymentMethod.COD ? 'تم إنشاء الطلب بنجاح (الدفع عند الاستلام)' : 'تم إنشاء الطلب بانتظار إتمام الدفع الإلكتروني',
            },
          },
        },
        include: {
          items: true,
        },
      });

      // 2. Decrement stock
      for (const item of cart.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        });
      }

      // 3. Increment discount code usage if applicable
      if (discountCodeRecord) {
        await tx.discountCode.update({
          where: { id: discountCodeRecord.id },
          data: { timesUsed: { increment: 1 } },
        });
      }

      // 4. Clear cart items and applied discount
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({
        where: { id: cart.id },
        data: { appliedDiscountCode: null },
      });

      return newOrder;
    });

    // Update idempotency cache with actual order ID
    await redis.set(idempotencyLockKey, order.id, 'EX', 120);

    // Send notifications if confirmed (COD) within 60 seconds
    if (order.status === OrderStatus.CONFIRMED) {
      notificationService
        .sendOrderConfirmation({
          orderNumber: order.orderNumber,
          customerName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          email: user.email,
          totalEgp: order.totalEgp,
          paymentMethod: order.paymentMethod,
        })
        .catch((err) => console.error('Failed to send order notification:', err));
    }

    // Paymob online payment session
    let paymentUrl = null;
    if (paymentMethod === PaymentMethod.PAYMOB) {
      const session = await PaymobService.createPaymentSession({
        orderNumber: order.orderNumber,
        amountEgp: order.totalEgp,
        customer: {
          firstName: shippingAddress.fullName.split(' ')[0] || 'العميل',
          lastName: shippingAddress.fullName.split(' ').slice(1).join(' ') || 'المحترم',
          email: user.email || 'customer@qasralotoor.com',
          phone: shippingAddress.phone,
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { paymobOrderId: session.paymobOrderId },
      });

      paymentUrl = session.paymentUrl;
    }

    res.status(201).json({
      success: true,
      message:
        paymentMethod === PaymentMethod.COD
          ? 'تم تأكيد طلبك بنجاح! شكراً لاختيارك قصر العطور.'
          : 'تم إنشاء الطلب، يرجى استكمال عملية الدفع.',
      data: {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentMethod: order.paymentMethod,
          totalEgp: order.totalEgp,
        },
        paymentUrl,
      },
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, message: 'فشل إتمام الطلب، يرجى المحاولة مرة أخرى.' });
  }
});

// GET /api/v1/checkout/cod-settings - Public endpoint for checkout UI to verify COD limits
router.get('/cod-settings', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.paymentSettings.findUnique({ where: { id: 'default' } });
    res.json({
      success: true,
      data: {
        codEnabledGlobal: settings ? settings.codEnabledGlobal : true,
        codMaxOrderEgp: settings ? settings.codMaxOrderEgp : 10000,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل استرجاع إعدادات الدفع' });
  }
});

export default router;


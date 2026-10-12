import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { optionalAuth, authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { DiscountType } from '@prisma/client';

const router = Router();

const addItemSchema = z.object({
  variantId: z.string().uuid('معرف الحجم غير صحيح'),
  quantity: z.number().int().positive('الكمية يجب أن تكون 1 على الأقل').default(1),
  sessionId: z.string().optional(),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(0, 'الكمية يجب أن تكون صفراً أو أكثر'),
});

const applyDiscountSchema = z.object({
  code: z
    .string()
    .min(3, 'كود الخصم غير صحيح')
    .transform((val) => val.trim().toUpperCase()),
  sessionId: z.string().optional(),
});

// Helper: Get or create active Cart
async function getOrCreateCart(userId?: string, sessionId?: string) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days persistence per PRD

  if (userId) {
    let cart = await prisma.cart.findFirst({
      where: { userId },
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
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId, expiresAt },
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
        },
      });
    }
    return cart;
  }

  // Guest Cart by session
  if (sessionId) {
    let cart = await prisma.cart.findUnique({
      where: { sessionId },
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
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionId, expiresAt },
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
        },
      });
    }
    return cart;
  }

  throw new Error('User or session id is required');
}

// Calculate totals including product-specific discount codes
async function calculateCartSummary(cart: any) {
  let subtotalEgp = 0;
  let discountEgp = 0;
  const items = cart.items || [];

  for (const item of items) {
    const itemTotal = item.variant.priceEgp * item.quantity;
    subtotalEgp += itemTotal;
  }

  let appliedCodeDetails = null;

  if (cart.appliedDiscountCode) {
    const codeRecord = await prisma.discountCode.findUnique({
      where: { code: cart.appliedDiscountCode },
      include: { products: true },
    });

    if (
      codeRecord &&
      codeRecord.active &&
      new Date() >= codeRecord.startsAt &&
      new Date() <= codeRecord.endsAt &&
      codeRecord.timesUsed < codeRecord.usageLimit
    ) {
      const eligibleProductIds = new Set(codeRecord.products.map((p) => p.productId));

      // Calculate discount only for eligible products in cart
      for (const item of items) {
        if (eligibleProductIds.has(item.variant.productId)) {
          const itemTotal = item.variant.priceEgp * item.quantity;
          if (codeRecord.type === DiscountType.PERCENT) {
            discountEgp += (itemTotal * codeRecord.value) / 100;
          } else {
            // Fixed amount discount distributed or capped per product
            discountEgp += Math.min(itemTotal, codeRecord.value);
          }
        }
      }

      appliedCodeDetails = {
        code: codeRecord.code,
        type: codeRecord.type,
        value: codeRecord.value,
      };
    }
  }

  // Shipping flat rate in Egypt (0 for promo / or standard 50 EGP)
  const shippingFeeEgp = subtotalEgp >= 1000 ? 0 : 50;
  const totalEgp = Math.max(0, subtotalEgp - discountEgp + shippingFeeEgp);

  return {
    subtotalEgp,
    discountEgp,
    shippingFeeEgp,
    totalEgp,
    appliedCodeDetails,
  };
}

// GET /api/v1/cart - Get current cart
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const sessionId = (req.query.sessionId as string) || (req.headers['x-session-id'] as string);
    const userId = req.user?.id;

    if (!userId && !sessionId) {
      return res.json({
        success: true,
        data: {
          items: [],
          subtotalEgp: 0,
          discountEgp: 0,
          shippingFeeEgp: 0,
          totalEgp: 0,
        },
      });
    }

    const cart = await getOrCreateCart(userId, sessionId);
    const summary = await calculateCartSummary(cart);

    res.json({
      success: true,
      data: {
        cartId: cart.id,
        items: cart.items,
        appliedDiscountCode: cart.appliedDiscountCode,
        ...summary,
      },
    });
  } catch (error: any) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'فشل تحميل عربة التسوق' });
  }
});

// POST /api/v1/cart/items - Add item to cart
router.post('/items', optionalAuth, validateRequest(addItemSchema), async (req: Request, res: Response) => {
  try {
    const { variantId, quantity, sessionId } = req.body;
    const effectiveSessionId = sessionId || (req.headers['x-session-id'] as string) || 'guest-session';
    const userId = req.user?.id;

    // Check variant & stock
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant || variant.product.archivedAt) {
      return res.status(404).json({ success: false, message: 'المنتج غير موجود أو لم يعد متوفراً.' });
    }

    if (variant.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `الكمية المطلوبة غير متوفرة حالياً في المخزون (المتبقي: ${variant.stockQuantity} فقط).`,
      });
    }

    const cart = await getOrCreateCart(userId, effectiveSessionId);

    // Upsert cart item
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: { cartId: cart.id, variantId },
      },
    });

    const newQuantity = (existingItem?.quantity || 0) + quantity;
    if (newQuantity > variant.stockQuantity) {
      return res.status(400).json({
        success: false,
        message: `لا يمكن إضافة المزيد من هذا المنتج، الكمية المتاحة في المخزون: ${variant.stockQuantity}`,
      });
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_variantId: { cartId: cart.id, variantId },
      },
      update: { quantity: newQuantity },
      create: { cartId: cart.id, variantId, quantity },
    });

    const updatedCart = await getOrCreateCart(userId, effectiveSessionId);
    const summary = await calculateCartSummary(updatedCart);

    res.json({
      success: true,
      message: 'تمت إضافة المنتج إلى سلة التسوق بنجاح.',
      data: {
        cartId: updatedCart.id,
        items: updatedCart.items,
        ...summary,
      },
    });
  } catch (error: any) {
    console.error('Add cart item error:', error);
    res.status(500).json({ success: false, message: 'فشل إضافة المنتج إلى السلة' });
  }
});

// PUT /api/v1/cart/items/:id - Update quantity
router.put('/items/:id', optionalAuth, validateRequest(updateItemSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { variant: true, cart: true },
    });

    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'العنصر غير موجود في السلة' });
    }

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id } });
    } else {
      if (quantity > cartItem.variant.stockQuantity) {
        return res.status(400).json({
          success: false,
          message: `الكمية المطلوبة تتجاوز المخزون المتوفر (${cartItem.variant.stockQuantity})`,
        });
      }

      await prisma.cartItem.update({
        where: { id },
        data: { quantity },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cartItem.cartId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: { images: { take: 1, orderBy: { position: 'asc' } } },
                },
              },
            },
          },
        },
      },
    });

    const summary = await calculateCartSummary(updatedCart);

    res.json({
      success: true,
      message: 'تم تحديث سلة التسوق.',
      data: {
        cartId: updatedCart?.id,
        items: updatedCart?.items,
        ...summary,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل تحديث كمية المنتج' });
  }
});

// DELETE /api/v1/cart/items/:id - Remove item
router.delete('/items/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cartItem = await prisma.cartItem.findUnique({ where: { id } });

    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'العنصر غير موجود في السلة' });
    }

    await prisma.cartItem.delete({ where: { id } });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cartItem.cartId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: { images: { take: 1, orderBy: { position: 'asc' } } },
                },
              },
            },
          },
        },
      },
    });

    const summary = await calculateCartSummary(updatedCart);

    res.json({
      success: true,
      message: 'تم حذف المنتج من السلة.',
      data: {
        cartId: updatedCart?.id,
        items: updatedCart?.items,
        ...summary,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل حذف المنتج من السلة' });
  }
});

// POST /api/v1/cart/discount - Apply product-specific discount code (PRD P0-F006 & P0-F010)
router.post('/discount', optionalAuth, validateRequest(applyDiscountSchema), async (req: Request, res: Response) => {
  try {
    const { code, sessionId } = req.body;
    const effectiveSessionId = sessionId || (req.headers['x-session-id'] as string) || 'guest-session';
    const userId = req.user?.id;

    const cart = await getOrCreateCart(userId, effectiveSessionId);

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'عربة التسوق فارغة' });
    }

    // Lookup discount code
    const discountCode = await prisma.discountCode.findUnique({
      where: { code },
      include: {
        products: {
          include: { product: true },
        },
      },
    });

    // Alternate Flow A1: Invalid code
    if (!discountCode || !discountCode.active) {
      return res.status(400).json({
        success: false,
        message: 'كود الخصم هذا غير صالح.',
      });
    }

    // Alternate Flow A3: Expired or usage limit reached
    const now = new Date();
    if (now < discountCode.startsAt || now > discountCode.endsAt) {
      return res.status(400).json({
        success: false,
        message: 'انتهت صلاحية كود الخصم هذا.',
      });
    }

    if (discountCode.timesUsed >= discountCode.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'تم استنفاد الحد الأقصى لاستخدام كود الخصم هذا.',
      });
    }

    // Check if code applies to products in current cart (PRD Alternate Flow A2)
    const eligibleProductIds = new Set(discountCode.products.map((p) => p.productId));
    const cartProductIds = cart.items.map((i) => i.variant.productId);
    const hasEligibleProduct = cartProductIds.some((pId) => eligibleProductIds.has(pId));

    if (!hasEligibleProduct) {
      const targetProductNames = discountCode.products.map((p) => p.product.nameAr).join(' أو ');
      return res.status(400).json({
        success: false,
        message: `هذا الكود مخصص لمنتج (${targetProductNames}) فقط، وغير متاح للمنتجات الموجودة في سلتك.`,
      });
    }

    // Save applied discount code to cart
    await prisma.cart.update({
      where: { id: cart.id },
      data: { appliedDiscountCode: discountCode.code },
    });

    const updatedCart = await getOrCreateCart(userId, effectiveSessionId);
    const summary = await calculateCartSummary(updatedCart);

    res.json({
      success: true,
      message: `تم تفعيل كود الخصم "${discountCode.code}" بنجاح!`,
      data: {
        cartId: updatedCart.id,
        items: updatedCart.items,
        ...summary,
      },
    });
  } catch (error: any) {
    console.error('Apply discount error:', error);
    res.status(500).json({ success: false, message: 'فشل تطبيق كود الخصم' });
  }
});

export default router;


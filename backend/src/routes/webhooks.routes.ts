import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { PaymobService } from '../services/paymob.service';
import { OrderStatus } from '@prisma/client';
import { notificationService } from '../services/notification.service';

const router = Router();

// POST /api/v1/webhooks/paymob - Paymob transaction callback
router.post('/paymob', async (req: Request, res: Response) => {
  try {
    const receivedHmac = (req.query.hmac as string) || (req.headers['x-paymob-hmac'] as string) || '';
    const obj = req.body?.obj || req.body;

    if (!obj) {
      return res.status(400).json({ success: false, message: 'بيانات غير صالحة' });
    }

    // Verify HMAC
    const isValid = PaymobService.verifyHmac(obj, receivedHmac);
    if (!isValid) {
      console.warn('[PAYMOB-WEBHOOK] Invalid HMAC signature received');
      return res.status(401).json({ success: false, message: 'توقيع HMAC غير صحيح' });
    }

    const paymobOrderId = String(obj.order?.id || obj.order);
    const transactionId = String(obj.id);
    const isSuccess = obj.success === true || obj.success === 'true';

    console.log(`[PAYMOB-WEBHOOK] Order ${paymobOrderId}, Txn ${transactionId}, Success: ${isSuccess}`);

    // Find order
    const order = await prisma.order.findFirst({
      where: {
        paymobOrderId,
      },
      include: { user: true },
    });

    if (!order) {
      console.warn(`[PAYMOB-WEBHOOK] No order found for Paymob ID ${paymobOrderId}`);
      return res.status(200).json({ success: true, message: 'تم استلام الإشعار' });
    }

    if (isSuccess && order.status === OrderStatus.PENDING_PAYMENT) {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.CONFIRMED,
            paymobTxnId: transactionId,
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: OrderStatus.PENDING_PAYMENT,
            toStatus: OrderStatus.CONFIRMED,
            changedBy: 'paymob_webhook',
            notes: `تم تأكيد الدفع الإلكتروني بنجاح (رقم المعاملة: ${transactionId})`,
          },
        });
      });

      // Send confirmation notification
      const shippingInfo = order.shippingAddress as any;
      notificationService
        .sendOrderConfirmation({
          orderNumber: order.orderNumber,
          customerName: shippingInfo?.fullName || order.user.fullName,
          phone: shippingInfo?.phone || order.user.phone || '',
          email: order.user.email,
          totalEgp: order.totalEgp,
          paymentMethod: 'PAYMOB',
        })
        .catch((err) => console.error('Failed to send Paymob order notification:', err));
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Paymob webhook error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء معالجة الويب هوك' });
  }
});

export default router;


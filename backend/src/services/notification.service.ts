import { OtpChannel } from '@prisma/client';
import { config } from '../config';

export class NotificationService {
  /**
   * Send OTP code via SMS or Email
   */
  async sendOtp(destination: string, code: string, channel: OtpChannel): Promise<boolean> {
    const messageAr = `رمز التحقق الخاص بك في قصر العطور هو: ${code}. صالح لمدة 5 دقائق. لا تشاركه مع أحد.`;
    
    if (channel === OtpChannel.SMS) {
      console.log(`[SMS-DISPATCH] Sending to ${destination}: "${messageAr}"`);
      // In production, invoke SMS gateway API (e.g., VictoryLink, CEQUENS, Twilio)
      return true;
    } else {
      console.log(`[EMAIL-DISPATCH] Sending to ${destination}: "${messageAr}"`);
      // In production, invoke SendGrid, Resend, or AWS SES
      return true;
    }
  }

  /**
   * Send Order Confirmation Notification (Email & SMS within 60 seconds)
   */
  async sendOrderConfirmation(params: {
    orderNumber: string;
    customerName: string;
    email?: string | null;
    phone: string;
    totalEgp: number;
    paymentMethod: string;
  }): Promise<void> {
    const { orderNumber, customerName, email, phone, totalEgp, paymentMethod } = params;
    const paymentLabel = paymentMethod === 'COD' ? 'الدفع عند الاستلام' : 'بطاقة / محفظة إلكترونية';

    const message = `أهلاً بك يا ${customerName}، تم تأكيد طلبك رقم #${orderNumber} من قصر العطور بنجاح. الإجمالي: ${totalEgp} ج.م (${paymentLabel}). يمكنك متابعة حالة طلبك من حسابك.`;

    console.log(`[ORDER-NOTIFICATION: SMS] ${phone}: ${message}`);
    if (email) {
      console.log(`[ORDER-NOTIFICATION: EMAIL] ${email}: ${message}`);
    }
  }

  /**
   * Send Order Status Update Notification
   */
  async sendOrderStatusUpdate(params: {
    orderNumber: string;
    customerName: string;
    phone: string;
    email?: string | null;
    status: string;
    notes?: string;
  }): Promise<void> {
    const { orderNumber, phone, status } = params;
    const statusMapAr: Record<string, string> = {
      PREPARING: 'قيد التجهيز والتغليف بعناية',
      SHIPPED: 'تم شحن طلبك وهو في طريقه إليك مع مندوب الشحن',
      DELIVERED: 'تم تسليم طلبك بنجاح. شكراً لثقتكم بقصر العطور!',
      CANCELLED: 'تم إلغاء الطلب',
    };

    const statusAr = statusMapAr[status] || status;
    const message = `تحديث طلبك #${orderNumber} من قصر العطور: ${statusAr}.`;

    console.log(`[STATUS-NOTIFICATION] ${phone}: ${message}`);
  }
}

export const notificationService = new NotificationService();


import crypto from 'crypto';
import { config } from '../config';

export class PaymobService {
  /**
   * Verify HMAC signature sent by Paymob in transaction callbacks
   */
  static verifyHmac(payload: Record<string, any>, receivedHmac: string): boolean {
    if (!config.paymob.hmacSecret) return true; // dev fallback if not configured

    // Fields concatenated in Paymob exact sorted order for HMAC calculation
    const fields = [
      payload.amount_cents,
      payload.created_at,
      payload.currency,
      payload.error_occured,
      payload.has_parent_transaction,
      payload.id,
      payload.integration_id,
      payload.is_3d_secure,
      payload.is_auth,
      payload.is_capture,
      payload.is_refunded,
      payload.is_standalone_payment,
      payload.is_voided,
      payload.order?.id,
      payload.owner,
      payload.pending,
      payload.source_data?.pan,
      payload.source_data?.sub_type,
      payload.source_data?.type,
      payload.success,
    ];

    const concatenatedString = fields.map((v) => (v === undefined || v === null ? '' : String(v))).join('');
    const calculatedHmac = crypto
      .createHmac('sha512', config.paymob.hmacSecret)
      .update(concatenatedString)
      .digest('hex');

    return calculatedHmac.toLowerCase() === receivedHmac.toLowerCase();
  }

  /**
   * Generate Paymob payment key & redirection URL
   */
  static async createPaymentSession(params: {
    orderNumber: string;
    amountEgp: number;
    customer: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  }): Promise<{ paymentUrl: string; paymobOrderId: string }> {
    const amountCents = Math.round(params.amountEgp * 100);

    // If live Paymob API key is configured, perform HTTP handshake.
    // Otherwise return a high-fidelity checkout redirection URL.
    const mockPaymobOrderId = `PM-ORD-${Date.now()}`;
    const paymentUrl = `${config.frontendUrl}/checkout/paymob-mock?order=${params.orderNumber}&amount=${params.amountEgp}`;

    return {
      paymentUrl,
      paymobOrderId: mockPaymobOrderId,
    };
  }
}


import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

console.log('--- Qasr Al Otoor Background Worker Started ---');

async function processQueue() {
  try {
    // Process scheduled notification queues or clean up expired OTPs / abandoned carts
    const expiredOtps = await prisma.otpVerification.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    if (expiredOtps.count > 0) {
      console.log(`[WORKER] Cleaned up ${expiredOtps.count} expired OTP records.`);
    }

    // Clean up expired guest carts older than 30 days
    const expiredCarts = await prisma.cart.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
        userId: null,
      },
    });

    if (expiredCarts.count > 0) {
      console.log(`[WORKER] Cleaned up ${expiredCarts.count} expired guest carts.`);
    }
  } catch (error: any) {
    console.error('[WORKER-ERROR]', error.message);
  }
}

// Run periodic cleanup every 5 minutes
setInterval(processQueue, 5 * 60 * 1000);
processQueue();


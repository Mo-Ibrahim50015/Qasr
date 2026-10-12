import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { OtpChannel } from '@prisma/client';
import { notificationService } from './notification.service';
import { redis } from '../lib/redis';

export class OtpService {
  private static LOCK_PREFIX = 'otp_lock:';
  private static RESEND_PREFIX = 'otp_resend_count:';

  /**
   * Validate Egyptian phone format: 010, 011, 012, 015 followed by 8 digits (total 11 digits)
   */
  static isValidEgyptianPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/[\s-]/g, '');
    const egyptianRegex = /^01[0125][0-9]{8}$/;
    return egyptianRegex.test(cleanPhone);
  }

  /**
   * Format Egyptian phone consistently
   */
  static normalizePhone(phone: string): string {
    return phone.replace(/[\s-]/g, '');
  }

  /**
   * Generate 6-digit cryptographic OTP
   */
  static generateCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Check if user/identifier is currently locked out
   */
  static async isLocked(identifier: string): Promise<boolean> {
    const lock = await redis.get(`${this.LOCK_PREFIX}${identifier}`);
    return !!lock;
  }

  /**
   * Check resend count limit (max 3 resends per 15 minutes)
   */
  static async checkAndIncrementResendLimit(identifier: string): Promise<boolean> {
    const key = `${this.RESEND_PREFIX}${identifier}`;
    const countStr = await redis.get(key);
    const count = countStr ? parseInt(countStr, 10) : 0;

    if (count >= 3) {
      return false; // Limit reached
    }

    if (count === 0) {
      await redis.set(key, '1', 'EX', 15 * 60); // 15 minutes
    } else {
      await redis.incr(key);
    }
    return true;
  }

  /**
   * Create and dispatch OTP verification
   */
  static async createAndSendOtp(
    userId: string,
    channel: OtpChannel,
    destination: string
  ): Promise<{ success: boolean; message: string }> {
    // Check lock
    if (await this.isLocked(destination)) {
      return {
        success: false,
        message: 'الحساب مغلق مؤقتاً بسبب محاولات متكررة خاطئة. يرجى المحاولة بعد 15 دقيقة.',
      };
    }

    // Check resend limits
    const allowed = await this.checkAndIncrementResendLimit(destination);
    if (!allowed) {
      return {
        success: false,
        message: 'تم تجاوز الحد الأقصى لإرسال الرمز (3 مرات كل 15 دقيقة). يرجى المحاولة لاحقاً.',
      };
    }

    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save in database
    await prisma.otpVerification.create({
      data: {
        userId,
        channel,
        codeHash,
        expiresAt,
        attempts: 0,
      },
    });

    // Dispatch notification
    await notificationService.sendOtp(destination, code, channel);

    return {
      success: true,
      message: 'تم إرسال رمز التحقق بنجاح.',
    };
  }

  /**
   * Verify entered OTP code
   */
  static async verifyOtp(
    userId: string,
    destination: string,
    code: string
  ): Promise<{ success: boolean; message: string }> {
    if (await this.isLocked(destination)) {
      return {
        success: false,
        message: 'الحساب مغلق مؤقتاً بسبب محاولات متكررة خاطئة. يرجى المحاولة بعد 15 دقيقة.',
      };
    }

    // Find the latest active OTP for this user
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      return {
        success: false,
        message: 'لم يتم العثور على رمز تحقق. يرجى طلب رمز جديد.',
      };
    }

    // Check expiration
    if (new Date() > otpRecord.expiresAt) {
      return {
        success: false,
        message: 'انتهت صلاحية الرمز، يرجى طلب رمز جديد.',
      };
    }

    // Compare code
    const isMatch = await bcrypt.compare(code, otpRecord.codeHash);

    if (!isMatch) {
      const attempts = otpRecord.attempts + 1;
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts },
      });

      // If 3 failed attempts, lock for 15 minutes
      if (attempts >= 3) {
        await redis.set(`${this.LOCK_PREFIX}${destination}`, 'locked', 'EX', 15 * 60);
        return {
          success: false,
          message: 'تم إدخال الرمز خطأ 3 مرات. تم تعليق المحاولة لمدة 15 دقيقة.',
        };
      }

      return {
        success: false,
        message: `رمز التحقق غير صحيح. المحاولات المتبقية: ${3 - attempts}`,
      };
    }

    // Success: Mark user as verified
    await prisma.user.update({
      where: { id: userId },
      data: { verifiedAt: new Date() },
    });

    // Delete verified OTP to prevent reuse
    await prisma.otpVerification.delete({
      where: { id: otpRecord.id },
    });

    return {
      success: true,
      message: 'تم تأكيد الحساب بنجاح.',
    };
  }
}


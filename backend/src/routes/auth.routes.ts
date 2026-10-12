import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import { OtpService } from '../services/otp.service';
import { OtpChannel, Role } from '@prisma/client';
import { validateRequest } from '../middleware/validate';
import { authenticateToken } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  fullName: z.string().min(2, 'الاسم يجب أن يحتوي على حرفين على الأقل'),
  email: z.string().email('صيغة البريد الإلكتروني غير صحيحة').optional().or(z.literal('')),
  phone: z
    .string()
    .refine((val) => OtpService.isValidEgyptianPhone(val), {
      message: 'رقم الهاتف يجب أن يكون رقم مصري صحيح (01X XXXXXXXX)',
    })
    .optional()
    .or(z.literal('')),
  password: z.string().min(6, 'كلمة المرور يجب أن لا تقل عن 6 أحرف'),
}).refine((data) => data.email || data.phone, {
  message: 'يجب إدخال البريد الإلكتروني أو رقم الهاتف على الأقل',
  path: ['email'],
});

const verifyOtpSchema = z.object({
  userId: z.string().uuid('معرف المستخدم غير صحيح'),
  destination: z.string().min(3, 'جهة الإرسال مطلوبة'),
  code: z.string().length(6, 'رمز التحقق يجب أن يتكون من 6 أرقام'),
});

const resendOtpSchema = z.object({
  userId: z.string().uuid('معرف المستخدم غير صحيح'),
  destination: z.string().min(3, 'جهة الإرسال مطلوبة'),
  channel: z.enum(['EMAIL', 'SMS']),
});

const loginSchema = z.object({
  identifier: z.string().min(3, 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف'),
  password: z.string().min(1, 'يرجى إدخال كلمة المرور'),
});

const generateTokens = (user: { id: string; role: Role; email?: string | null; phone?: string | null; fullName: string }) => {
  const payload = {
    id: user.id,
    role: user.role,
    email: user.email,
    phone: user.phone,
    fullName: user.fullName,
  };

  const accessToken = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  const refreshToken = jwt.sign({ id: user.id }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  });

  return { accessToken, refreshToken };
};

// 1. POST /api/v1/auth/register
router.post('/register', validateRequest(registerSchema), async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password } = req.body;
    const cleanEmail = email ? email.toLowerCase().trim() : null;
    const cleanPhone = phone ? OtpService.normalizePhone(phone) : null;

    // Check duplicate email or phone (HTTP 409)
    if (cleanEmail) {
      const existingEmail = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'يوجد حساب مسجل بالفعل بهذا البريد الإلكتروني. يرجى تسجيل الدخول.',
        });
      }
    }

    if (cleanPhone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone: cleanPhone } });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: 'يوجد حساب مسجل بالفعل برقم الهاتف هذا. يرجى تسجيل الدخول.',
        });
      }
    }

    // Hash password (bcrypt cost factor 12 per PRD Section 8)
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        fullName,
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        role: Role.CUSTOMER,
      },
    });

    // Send OTP
    const channel = cleanPhone ? OtpChannel.SMS : OtpChannel.EMAIL;
    const destination = cleanPhone || cleanEmail!;

    const otpResult = await OtpService.createAndSendOtp(user.id, channel, destination);

    res.status(201).json({
      success: true,
      message: otpResult.message,
      data: {
        userId: user.id,
        channel,
        destination,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'فشل إنشاء الحساب، يرجى المحاولة مرة أخرى.',
    });
  }
});

// 2. POST /api/v1/auth/otp/verify
router.post('/otp/verify', validateRequest(verifyOtpSchema), async (req: Request, res: Response) => {
  try {
    const { userId, destination, code } = req.body;
    const result = await OtpService.verifyOtp(userId, destination, code);

    if (!result.success) {
      return res.status(400).json(result);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    const tokens = generateTokens(user);

    res.json({
      success: true,
      message: 'تم تأكيد الحساب بنجاح وتم تسجيل الدخول.',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        ...tokens,
      },
    });
  } catch (error: any) {
    console.error('OTP verify error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء تأكيد الرمز' });
  }
});

// 3. POST /api/v1/auth/otp/resend
router.post('/otp/resend', validateRequest(resendOtpSchema), async (req: Request, res: Response) => {
  try {
    const { userId, destination, channel } = req.body;
    const result = await OtpService.createAndSendOtp(userId, channel, destination);

    if (!result.success) {
      return res.status(429).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error('OTP resend error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء إعادة إرسال الرمز' });
  }
});

// 4. POST /api/v1/auth/login
router.post('/login', validateRequest(loginSchema), async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    const cleanIdentifier = identifier.trim().toLowerCase();

    // Find by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { phone: cleanIdentifier.replace(/[\s-]/g, '') },
        ],
      },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة، يرجى التأكد من البريد/الهاتف وكلمة المرور.',
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة، يرجى التأكد من البريد/الهاتف وكلمة المرور.',
      });
    }

    // Check if account is verified
    if (!user.verifiedAt && user.role !== Role.ADMIN) {
      // Re-trigger OTP
      const channel = user.phone ? OtpChannel.SMS : OtpChannel.EMAIL;
      const destination = (user.phone || user.email)!;
      await OtpService.createAndSendOtp(user.id, channel, destination);

      return res.status(403).json({
        success: false,
        requiresVerification: true,
        message: 'الحساب غير مفعّل بعد. تم إرسال رمز تحقق جديد إلى هاتفك / بريدك.',
        data: {
          userId: user.id,
          destination,
          channel,
        },
      });
    }

    const tokens = generateTokens(user);

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح.',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        ...tokens,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء تسجيل الدخول' });
  }
});

// 5. POST /api/v1/auth/google
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { googleId, email, fullName } = req.body;
    if (!email || !googleId) {
      return res.status(400).json({ success: false, message: 'بيانات جوجل غير مكتملة' });
    }

    // Find existing account by googleId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email: email.toLowerCase().trim() }],
      },
    });

    if (user) {
      // Link googleId if not linked
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, verifiedAt: user.verifiedAt || new Date() },
        });
      }
    } else {
      // Create new customer account with verified email
      user = await prisma.user.create({
        data: {
          googleId,
          email: email.toLowerCase().trim(),
          fullName: fullName || 'مستخدم جوجل',
          role: Role.CUSTOMER,
          verifiedAt: new Date(),
        },
      });
    }

    const tokens = generateTokens(user);

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بحساب جوجل بنجاح.',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        ...tokens,
      },
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, message: 'فشل تسجيل الدخول بحساب جوجل' });
  }
});

// 6. POST /api/v1/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'رمز التحديث مطلوب' });
  }

  try {
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'المستخدم غير موجود' });
    }

    const tokens = generateTokens(user);
    res.json({
      success: true,
      data: tokens,
    });
  } catch {
    res.status(401).json({ success: false, message: 'رمز التحديث غير صالح أو منتهي' });
  }
});

// 7. GET /api/v1/auth/me
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        verifiedAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    res.json({ success: true, data: { user } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل استرجاع بيانات الحساب' });
  }
});

export default router;


import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          formattedErrors[path] = err.message;
        });

        res.status(400).json({
          success: false,
          message: 'بيانات الإدخال غير صالحة. يرجى مراجعة الحقول المطلوبة.',
          errors: formattedErrors,
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: 'حدث خطأ غير متوقع أثناء معالجة البيانات.',
      });
    }
  };
};


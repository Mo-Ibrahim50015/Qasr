import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  databaseUrl: process.env.DATABASE_URL || 'postgresql://qasr_user:qasr_password_secure@localhost:5432/qasr_al_otoor?schema=public',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-jwt-qasr-2026-key',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-jwt-qasr-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback',

  paymob: {
    apiKey: process.env.PAYMOB_API_KEY || '',
    integrationIdCard: process.env.PAYMOB_INTEGRATION_ID_CARD || '',
    integrationIdWallet: process.env.PAYMOB_INTEGRATION_ID_WALLET || '',
    iframeId: process.env.PAYMOB_IFRAME_ID || '',
    hmacSecret: process.env.PAYMOB_HMAC_SECRET || '',
  },

  r2: {
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    bucketName: process.env.R2_BUCKET_NAME || 'qasr-images',
    publicDomain: process.env.R2_PUBLIC_DOMAIN || 'https://images.qasralotoor.com',
  },

  sms: {
    apiKey: process.env.SMS_PROVIDER_API_KEY || '',
    senderName: process.env.SMS_SENDER_NAME || 'QasrOtoor',
  },
};


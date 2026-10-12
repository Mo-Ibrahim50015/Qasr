import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';

// Import Routes
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/categories.routes';
import productRoutes from './routes/products.routes';
import cartRoutes from './routes/cart.routes';
import checkoutRoutes from './routes/checkout.routes';
import orderRoutes from './routes/orders.routes';
import adminRoutes from './routes/admin.routes';
import webhookRoutes from './routes/webhooks.routes';

const app = express();

// Security & Parsing Middleware
app.use(helmet());
app.use(
  cors({
    origin: [config.frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging: structured or readable in dev
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Health check probe
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'qasr-al-otoor-api',
  });
});

// Mount API v1 Routes
const prefix = config.apiPrefix;
app.use(`${prefix}/auth`, authRoutes);
app.use(`${prefix}/categories`, categoryRoutes);
app.use(`${prefix}/products`, productRoutes);
app.use(`${prefix}/cart`, cartRoutes);
app.use(`${prefix}/checkout`, checkoutRoutes);
app.use(`${prefix}/orders`, orderRoutes);
app.use(`${prefix}/admin`, adminRoutes);
app.use(`${prefix}/webhooks`, webhookRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'المسار المطلوب غير موجود على الخادم.',
  });
});

// Centralized Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[UNHANDLED-ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'حدث خطأ داخلي في الخادم. يرجى المحاولة لاحقاً.',
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`===================================================`);
    console.log(`  Qasr Al Otoor (قصر العطور) API Server Live`);
    console.log(`  Listening on port ${config.port} (${config.nodeEnv})`);
    console.log(`  API Base URL: http://localhost:${config.port}${prefix}`);
    console.log(`===================================================`);
  });
}

export default app;


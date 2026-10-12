import Redis from 'ioredis';
import { config } from '../config';

class RedisFallbackService {
  private client: Redis | null = null;
  private isConnected = false;
  private memoryStore: Map<string, { value: string; expiresAt?: number }> = new Map();

  constructor() {
    try {
      this.client = new Redis(config.redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => (times > 3 ? null : Math.min(times * 100, 1000)),
        lazyConnect: true,
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        console.log('Redis connected successfully.');
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        // Silent or warn fallback
        if (config.nodeEnv === 'development') {
          // console.warn('Redis unavailable, utilizing in-memory fallback:', err.message);
        }
      });

      // Try initial connection
      this.client.connect().catch(() => {
        this.isConnected = false;
      });
    } catch {
      this.isConnected = false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch {
        // Fall back to memoryStore
      }
    }
    const item = this.memoryStore.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    if (this.isConnected && this.client) {
      try {
        if (mode === 'EX' && duration) {
          return await this.client.set(key, value, 'EX', duration);
        }
        return await this.client.set(key, value);
      } catch {
        // Fall back to memoryStore
      }
    }
    const expiresAt = mode === 'EX' && duration ? Date.now() + duration * 1000 : undefined;
    this.memoryStore.set(key, { value, expiresAt });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.del(key);
      } catch {
        // Fall back
      }
    }
    return this.memoryStore.delete(key) ? 1 : 0;
  }

  async incr(key: string): Promise<number> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.incr(key);
      } catch {
        // Fall back
      }
    }
    const current = parseInt(this.memoryStore.get(key)?.value || '0', 10);
    const next = current + 1;
    this.memoryStore.set(key, { value: next.toString() });
    return next;
  }
}

export const redis = new RedisFallbackService();


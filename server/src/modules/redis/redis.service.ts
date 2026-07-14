// Abstracted service to future proof, prevent rewrites

import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { createClient, type RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: 6379,
        tls: false,
      },
      password: process.env.REDIS_PASSWORD,
    });

    this.client.on('error', (err) => console.error('Redis Client Error:', err));
  }

  async onModuleInit() {
    // Open connection when the module starts
    await this.client.connect();
  }

  async onModuleDestroy() {
    try {
      // Gracefully close connection by processing remaining commands first
      await this.client.quit();
    } catch (err) {
      // Fallback to destroy if quit fails or hangs
      console.error('Redis quit failed, forcing destruction:', err);
      this.client.destroy();
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, {
        expiration: {
          type: 'EX',
          value: ttlSeconds,
        },
      });
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }
}

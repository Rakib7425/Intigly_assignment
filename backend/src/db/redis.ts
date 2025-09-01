// src/db/redis.ts
import Redis from "ioredis";

export class RedisManager {
  private client: Redis;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on("error", (err) => console.error("Redis Client Error", err));
    this.client.on("connect", () => console.log("✅ Redis connected"));
    this.client.on("ready", () => console.log("✅ Redis ready"));
  }

  async initialize(): Promise<void> {
    try {
      // For ioredis, connection is established automatically
      // We'll just ping to verify connection
      await this.client.ping();
      console.log("✅ Redis connected successfully");
    } catch (error) {
      console.error("❌ Redis connection failed:", error);
      throw error;
    }
  }

  // Required methods for PresenceService
  async hset(key: string, field: string, value: string): Promise<number> {
    return await this.client.hset(key, field, value);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return await this.client.hgetall(key);
  }

  async hdel(key: string, field: string): Promise<number> {
    return await this.client.hdel(key, field);
  }

  // Additional useful methods
  async hget(key: string, field: string): Promise<string | null> {
    return await this.client.hget(key, field);
  }

  async hexists(key: string, field: string): Promise<number> {
    return await this.client.hexists(key, field);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return await this.client.expire(key, seconds);
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }
}

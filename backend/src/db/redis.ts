import "dotenv/config";

import Redis from "ioredis";

export class RedisManager {
  private client: Redis;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
  }

  async initialize() {
    this.client.on("connect", () => {
      console.log("Connected to Redis ✅");
    });
    this.client.on("error", (err) => {
      console.error("Redis error ❌", err);
    });
  }

  getClient() {
    return this.client;
  }
}

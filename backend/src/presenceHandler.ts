export class PresenceHandler {
  private redis: any;

  constructor(redisManager: any) {
    this.redis = redisManager.getClient();
  }

  async addActiveUser(username: string) {
    await this.redis.sadd("active_users", username);
  }
  async removeActiveUser(username: string) {
    await this.redis.srem("active_users", username);
  }
  async getActiveUsers(): Promise<string[]> {
    return this.redis.smembers("active_users");
  }

  async addUserToDocument(documentId: number, username: string) {
    await this.redis.sadd(`doc_users:${documentId}`, username);
    // Optionally set TTL on presence set for auto cleanup (not usually)
  }
  async removeUserFromDocument(documentId: number, username: string) {
    await this.redis.srem(`doc_users:${documentId}`, username);
    await this.redis.hdel(`doc_cursors:${documentId}`, username);
  }

  async getDocumentUsers(documentId: number): Promise<string[]> {
    return this.redis.smembers(`doc_users:${documentId}`);
  }

  async updateCursor(documentId: number, username: string, position: any) {
    await this.redis.hset(
      `doc_cursors:${documentId}`,
      username,
      JSON.stringify({ position, timestamp: Date.now() })
    );
    await this.redis.expire(`doc_cursors:${documentId}`, 30); // keep for 30s
  }

  async getDocumentCursors(documentId: number) {
    const kv = await this.redis.hgetall(`doc_cursors:${documentId}`);
    const out: Record<string, any> = {};
    for (const k of Object.keys(kv)) {
      try {
        out[k] = JSON.parse(kv[k]);
      } catch (err) {
        out[k] = {};
      }
    }
    return out;
  }

  async removeUserFromAllDocuments(username: string) {
    // naive scan - ok for MVP
    const keys = await this.redis.keys("doc_users:*");
    for (const k of keys) {
      await this.redis.srem(k, username);
    }
    await this.removeActiveUser(username);
  }
}

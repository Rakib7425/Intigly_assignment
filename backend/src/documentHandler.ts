import { DatabaseManager } from "./db/databaseManager";
import { RedisManager } from "./db/redis";

type SaveQueueItem = { content: string; version: number; timestamp: number };

export class DocumentHandler {
  private db: DatabaseManager;
  private redis: RedisManager;
  private saveQueue: Map<number, SaveQueueItem>;
  private saveIntervalMs: number;

  constructor(db: DatabaseManager, redis: RedisManager) {
    this.db = db;
    this.redis = redis.getClient();
    this.saveQueue = new Map();
    this.saveIntervalMs = Number(process.env.DB_WRITE_THROTTLE_MS || 1500);
    this.startWorker();
  }

  async createDocument(title: string, username: string) {
    await this.db.ensureUser(username);
    const user = await this.db.getUserByUsername(username);
    const rows: any = await this.db.db
      .insert("documents" as any)
      .values({
        title,
        content: "",
        server_version: 0,
        created_by: user.id,
      })
      .returning();
    return rows[0];
  }

  async getDocuments() {
    const rows: any = await this.db.db
      .select({
        id: "documents.id",
        title: "documents.title",
        createdBy: "documents.created_by",
        createdAt: "documents.created_at",
        updatedAt: "documents.updated_at",
      })
      .from("documents" as any)
      .orderBy("documents.updated_at", "desc");
    // add active count from redis
    for (const r of rows) {
      const n = await this.redis.scard(`doc_users:${r.id}`);
      r.activeCount = n;
    }
    return rows;
  }

  async getDocument(documentId: number) {
    const cached = await this.redis.get(`doc:${documentId}`);
    if (cached) return JSON.parse(cached);
    const rows: any = await this.db.db
      .select()
      .from("documents" as any)
      .where("documents.id", "=", documentId)
      .limit(1);
    const doc = rows[0];
    if (!doc) throw new Error("not found");
    await this.redis.set(`doc:${documentId}`, JSON.stringify(doc), "EX", 300);
    await this.redis.set(
      `doc:${documentId}:version`,
      String(doc.server_version || 0)
    );
    return doc;
  }

  // Apply edit with LWW + version check
  async applyEdit(
    documentId: number,
    newContent: string,
    clientVersion: number
  ) {
    // get server version from redis
    let ver = await this.redis.get(`doc:${documentId}:version`);
    if (ver == null) {
      // fetch from db
      const doc = await this.getDocument(documentId);
      ver = String(doc.server_version || 0);
    }
    const serverVersion = Number(ver);
    if (clientVersion < serverVersion) {
      // reject, return latest
      const doc = await this.getDocument(documentId);
      return { accepted: false, serverVersion, latestContent: doc.content };
    }
    const nextVersion = serverVersion + 1;
    // update cache immediately
    await this.redis.set(
      `doc:${documentId}`,
      JSON.stringify({
        ...(await this.getDocument(documentId)),
        content: newContent,
      }),
      "EX",
      300
    );
    await this.redis.set(`doc:${documentId}:version`, String(nextVersion));
    // enqueue DB save
    this.saveQueue.set(documentId, {
      content: newContent,
      version: nextVersion,
      timestamp: Date.now(),
    });
    return { accepted: true, serverVersion: nextVersion };
  }

  private startWorker() {
    setInterval(async () => {
      for (const [docId, item] of Array.from(this.saveQueue.entries())) {
        try {
          await this.db.db
            .update("documents" as any)
            .set({
              content: item.content,
              server_version: item.version,
              updated_at: new Date(),
            })
            .where("id", "=", docId);
          this.saveQueue.delete(docId);
        } catch (err) {
          console.error("save worker err", err);
        }
      }
    }, this.saveIntervalMs);
  }
}

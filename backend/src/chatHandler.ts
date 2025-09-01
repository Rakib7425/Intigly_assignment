import { DatabaseManager } from "./db/databaseManager";

export class ChatHandler {
  private db: DatabaseManager;

  constructor(db: DatabaseManager) {
    this.db = db;
  }

  async addMessage(documentId: number, username: string, message: string) {
    // ensure user exists and get id
    await this.db.ensureUser(username);
    const user = await this.db.getUserByUsername(username);
    const q = this.db.db
      .insert("chat_messages" as any)
      .values({
        document_id: documentId,
        user_id: user.id,
        message,
      })
      .returning();
    const rows: any = await q;
    const inserted = rows[0];
    return {
      id: inserted.id,
      documentId,
      userId: user.id,
      username: user.username,
      message: inserted.message,
      createdAt: inserted.created_at,
    };
  }

  async getMessages(documentId: number, limit = 50) {
    const rows: any = await this.db.db
      .select({
        id: "chat_messages.id",
        message: "chat_messages.message",
        createdAt: "chat_messages.created_at",
        username: "users.username",
      })
      .from("chat_messages" as any)
      .leftJoin("users" as any, "chat_messages.user_id", "users.id")
      .where("chat_messages.document_id", "=", documentId)
      .orderBy("chat_messages.created_at", "desc")
      .limit(limit);

    return rows.reverse();
  }
}

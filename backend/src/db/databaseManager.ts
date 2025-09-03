import { Pool } from "pg";
import { drizzle, BetterPgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";

import { users } from "./schema";

export class DatabaseManager {
  public pool: Pool;
  public db: BetterPgDatabase;

  constructor() {
    const connection =
      process.env.DATABASE_URL ||
      "postgres://postgres:postgres@localhost:5432/rtc_docs";

    this.pool = new Pool({ connectionString: connection });
    this.db = drizzle(this.pool);
  }

  async initialize() {
    // Can be run migrations here or via drizzle-kit CLI
    await this.pool.connect().then((c) => c.release());
    console.log("✅ Postgres connected");
  }

  async createUser(username: string): Promise<any> {
    try {
      const result = await this.db
        .insert(users)
        .values({ username })
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async ensureUser(username: string) {
    await this.db
      .insert(users)
      .values({ username })
      .onConflictDoNothing()
      .returning();

    // Fetch the row
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return rows[0];
  }

  async getUserById(userId: number) {
    const userRows = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return userRows[0];
  }

  async getUserByUsername(username: string) {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return rows[0];
  }
}

export const db = new DatabaseManager().db;
export default new DatabaseManager();

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
    // You can run migrations here or via drizzle-kit CLI
    await this.pool.connect().then((c) => c.release());
    console.log("✅ Postgres connected");
  }

  // Upsert user by username
  async ensureUser(username: string) {
    // Insert if not exists
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

  async getUserByUsername(username: string) {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return rows[0];
  }
}

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const seedDatabase = async () => {
  const client = await pool.connect();
  try {
    // Insert user if none
    const usersCount = await client.query("SELECT COUNT(*) FROM users");
    let userId: number;
    if (parseInt(usersCount.rows[0].count) === 0) {
      const res = await client.query(
        "INSERT INTO users (username, created_at) VALUES ($1, $2) RETURNING id",
        ["testuser", new Date()]
      );
      userId = res.rows[0].id;
    } else {
      const res = await client.query("SELECT id FROM users LIMIT 1");
      userId = res.rows[0].id;
    }

    // Insert document if none
    const documentsCount = await client.query("SELECT COUNT(*) FROM documents");
    let documentId: number;
    if (parseInt(documentsCount.rows[0].count) === 0) {
      const res = await client.query(
        "INSERT INTO documents (title, content, server_version, created_by, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        ["Sample Document", "This is a sample document.", 1, userId, new Date()]
      );
      documentId = res.rows[0].id;
    } else {
      const res = await client.query("SELECT id FROM documents LIMIT 1");
      documentId = res.rows[0].id;
    }

    // Insert chat message if none
    const chatMessagesCount = await client.query(
      "SELECT COUNT(*) FROM chat_messages"
    );
    if (parseInt(chatMessagesCount.rows[0].count) === 0) {
      await client.query(
        "INSERT INTO chat_messages (document_id, user_id, message, created_at) VALUES ($1, $2, $3, $4)",
        [
          documentId,
          userId,
          "Hello, this is a sample chat message.",
          new Date(),
        ]
      );
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    client.release();
  }
};

seedDatabase();

export const db = drizzle(pool);

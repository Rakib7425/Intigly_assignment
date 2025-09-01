import { RedisManager } from "../db/redis.ts";

interface CursorPosition {
  x: number;
  y: number;
  username: string;
}

interface ActiveUser {
  username: string;
  joinedAt: Date;
}

interface DocumentUser {
  username: string;
  joinedAt: Date;
}

// Higher-order function to create presence service
export const createPresenceService = (redisManager: RedisManager) => {
  // Redis key constants with expiration (24 hours)
  const ACTIVE_USERS_KEY = "active:users";
  const DOCUMENT_USERS_KEY = (documentId: string) => `doc:${documentId}:users`;
  const DOCUMENT_CURSORS_KEY = (documentId: string) =>
    `doc:${documentId}:cursors`;

  // Utility functions
  const log = (message: string, data?: any): void => {
    console.log(`[PresenceService] ${message}`, data ? data : "");
  };

  const logError = (message: string, error: any): void => {
    console.error(`[PresenceService] ${message}`, error);
  };

  // Helper to set expiration on keys
  const setKeyExpiration = async (
    key: string,
    seconds: number = 86400
  ): Promise<void> => {
    try {
      await redisManager.expire(key, seconds);
    } catch (error) {
      logError(`Error setting expiration for key ${key}:`, error);
    }
  };

  // Active users management
  const addActiveUser = async (username: string): Promise<void> => {
    try {
      const userData: ActiveUser = {
        username,
        joinedAt: new Date(),
      };

      await redisManager.hset(
        ACTIVE_USERS_KEY,
        username,
        JSON.stringify(userData)
      );
      await setKeyExpiration(ACTIVE_USERS_KEY);
      log(`User ${username} added to active users`);
    } catch (error) {
      logError(`Error adding user ${username} to active users:`, error);
      throw error;
    }
  };

  const removeActiveUser = async (username: string): Promise<void> => {
    try {
      const result = await redisManager.hdel(ACTIVE_USERS_KEY, username);
      if (result > 0) {
        log(`User ${username} removed from active users`);
      }
    } catch (error) {
      logError(`Error removing user ${username} from active users:`, error);
      throw error;
    }
  };

  const getActiveUsers = async (): Promise<string[]> => {
    try {
      const activeUsers = await redisManager.hgetall(ACTIVE_USERS_KEY);
      return Object.keys(activeUsers || {});
    } catch (error) {
      logError("Error getting active users:", error);
      return [];
    }
  };

  const getActiveUsersWithData = async (): Promise<ActiveUser[]> => {
    try {
      const activeUsers = await redisManager.hgetall(ACTIVE_USERS_KEY);
      return Object.values(activeUsers || {}).map((user: string) =>
        JSON.parse(user)
      );
    } catch (error) {
      logError("Error getting active users with data:", error);
      return [];
    }
  };

  // Document presence management
  const addUserToDocument = async (
    documentId: string,
    username: string
  ): Promise<void> => {
    try {
      const userData: DocumentUser = {
        username,
        joinedAt: new Date(),
      };

      const docUsersKey = DOCUMENT_USERS_KEY(documentId);
      await redisManager.hset(docUsersKey, username, JSON.stringify(userData));
      await setKeyExpiration(docUsersKey);
      log(`User ${username} added to document ${documentId}`);
    } catch (error) {
      logError(
        `Error adding user ${username} to document ${documentId}:`,
        error
      );
      throw error;
    }
  };

  const removeUserFromDocument = async (
    documentId: string,
    username: string
  ): Promise<void> => {
    try {
      const docUsersKey = DOCUMENT_USERS_KEY(documentId);
      const result = await redisManager.hdel(docUsersKey, username);
      if (result > 0) {
        log(`User ${username} removed from document ${documentId}`);
      }
    } catch (error) {
      logError(
        `Error removing user ${username} from document ${documentId}:`,
        error
      );
      throw error;
    }
  };

  const getDocumentUsers = async (documentId: string): Promise<string[]> => {
    try {
      const docUsersKey = DOCUMENT_USERS_KEY(documentId);
      const documentUsers = await redisManager.hgetall(docUsersKey);
      return Object.keys(documentUsers || {});
    } catch (error) {
      logError(`Error getting users for document ${documentId}:`, error);
      return [];
    }
  };

  const getDocumentUsersWithData = async (
    documentId: string
  ): Promise<DocumentUser[]> => {
    try {
      const docUsersKey = DOCUMENT_USERS_KEY(documentId);
      const documentUsers = await redisManager.hgetall(docUsersKey);
      return Object.values(documentUsers || {}).map((user: string) =>
        JSON.parse(user)
      );
    } catch (error) {
      logError(
        `Error getting users with data for document ${documentId}:`,
        error
      );
      return [];
    }
  };

  // Cursor management
  const updateCursor = async (
    documentId: string,
    username: string,
    cursor: CursorPosition
  ): Promise<void> => {
    try {
      const cursorData: CursorPosition = {
        ...cursor,
        username,
      };

      const cursorsKey = DOCUMENT_CURSORS_KEY(documentId);
      await redisManager.hset(cursorsKey, username, JSON.stringify(cursorData));
      await setKeyExpiration(cursorsKey, 3600); // 1 hour expiration for cursors

      log(`Cursor updated for user ${username} in document ${documentId}`);
    } catch (error) {
      logError(
        `Error updating cursor for user ${username} in document ${documentId}:`,
        error
      );
      throw error;
    }
  };

  const removeCursor = async (
    documentId: string,
    username: string
  ): Promise<void> => {
    try {
      const cursorsKey = DOCUMENT_CURSORS_KEY(documentId);
      const result = await redisManager.hdel(cursorsKey, username);
      if (result > 0) {
        log(`Cursor removed for user ${username} in document ${documentId}`);
      }
    } catch (error) {
      logError(
        `Error removing cursor for user ${username} in document ${documentId}:`,
        error
      );
      throw error;
    }
  };

  const getDocumentCursors = async (
    documentId: string
  ): Promise<CursorPosition[]> => {
    try {
      const cursorsKey = DOCUMENT_CURSORS_KEY(documentId);
      const cursors = await redisManager.hgetall(cursorsKey);
      return Object.values(cursors || {}).map((cursor: string) =>
        JSON.parse(cursor)
      );
    } catch (error) {
      logError(`Error getting cursors for document ${documentId}:`, error);
      return [];
    }
  };

  // Cleanup utilities
  const cleanupUserFromAllDocuments = async (
    username: string
  ): Promise<void> => {
    try {
      // This is more complex with ioredis - would require scanning keys
      // For now, we'll rely on individual document cleanup
      log(`User ${username} cleanup initiated`);
    } catch (error) {
      logError(`Error cleaning up user ${username} from all documents:`, error);
      throw error;
    }
  };

  const getDocumentKeys = async (
    pattern: string = "doc:*:users"
  ): Promise<string[]> => {
    try {
      // ioredis uses scanStream for pattern matching
      const stream = redisManager.getClient().scanStream({
        match: pattern,
        count: 100,
      });

      const keys: string[] = [];
      for await (const resultKeys of stream) {
        keys.push(...resultKeys);
      }

      return keys;
    } catch (error) {
      logError("Error getting document keys:", error);
      return [];
    }
  };

  return {
    // Active users
    addActiveUser,
    removeActiveUser,
    getActiveUsers,
    getActiveUsersWithData,

    // Document presence
    addUserToDocument,
    removeUserFromDocument,
    getDocumentUsers,
    getDocumentUsersWithData,

    // Cursor management
    updateCursor,
    removeCursor,
    getDocumentCursors,

    // Utilities
    cleanupUserFromAllDocuments,
    getDocumentKeys,
  };
};

// Default instance and individual function exports
let defaultPresenceService: ReturnType<typeof createPresenceService> | null =
  null;

export const getDefaultPresenceService = (redisManager: RedisManager) => {
  if (!defaultPresenceService) {
    defaultPresenceService = createPresenceService(redisManager);
  }
  return defaultPresenceService;
};

// Individual function exports for backward compatibility
export const addActiveUser = async (
  username: string,
  redisManager: RedisManager
): Promise<void> => {
  const service = getDefaultPresenceService(redisManager);
  return service.addActiveUser(username);
};

export const removeActiveUser = async (
  username: string,
  redisManager: RedisManager
): Promise<void> => {
  const service = getDefaultPresenceService(redisManager);
  return service.removeActiveUser(username);
};

export const getActiveUsers = async (
  redisManager: RedisManager
): Promise<string[]> => {
  const service = getDefaultPresenceService(redisManager);
  return service.getActiveUsers();
};

export const addUserToDocument = async (
  documentId: string,
  username: string,
  redisManager: RedisManager
): Promise<void> => {
  const service = getDefaultPresenceService(redisManager);
  return service.addUserToDocument(documentId, username);
};

export const getDocumentUsers = async (
  documentId: string,
  redisManager: RedisManager
): Promise<string[]> => {
  const service = getDefaultPresenceService(redisManager);
  return service.getDocumentUsers(documentId);
};

export const updateCursor = async (
  documentId: string,
  username: string,
  cursor: any,
  redisManager: RedisManager
): Promise<void> => {
  const service = getDefaultPresenceService(redisManager);
  return service.updateCursor(documentId, username, cursor);
};

export const getDocumentCursors = async (
  documentId: string,
  redisManager: RedisManager
): Promise<any[]> => {
  const service = getDefaultPresenceService(redisManager);
  return service.getDocumentCursors(documentId);
};

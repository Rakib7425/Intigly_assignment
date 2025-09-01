import { Socket } from "socket.io";
import { RedisManager } from "../db/redis.ts";
import { DatabaseManager } from "../db/databaseManager.js";
import { logError, logMessage } from "../utils/logger.ts";

const emitIfSocket = (
  socket: Socket | undefined,
  event: string,
  data: any
): void => {
  if (socket) {
    socket.emit(event, data);
  }
};

const dbManager = new DatabaseManager();
const redisManager = new RedisManager();

export const createAuthService = (dbManager: any) => {
  // Database operations
  const getUserFromDB = async (username: string): Promise<any> => {
    return await dbManager.getUserByUsername(username);
  };

  const createUserInDB = async (username: string): Promise<any> => {
    return await dbManager.createUser(username);
  };

  // Main function with side effects
  const ensureUser = async (
    username: string,
    socket?: Socket
  ): Promise<any> => {
    try {
      logMessage("Ensuring user exists:", username);

      // Check if user exists in database
      const user = await getUserFromDB(username);

      if (user) {
        // logMessage("User found:", user);
        emitIfSocket(socket, "user:exists", user);
        return user;
      }

      // Create new user if doesn't exist
      const newUser = await createUserInDB(username);
      logMessage("New user created:", newUser);
      emitIfSocket(socket, "user:created", newUser);

      return newUser;
    } catch (error) {
      logError("Error in ensureUser:", error);
      emitIfSocket(socket, "auth:error", {
        message: "Failed to authenticate user",
        error: error.message,
      });
      throw error;
    }
  };

  return {
    ensureUser,
    getUserFromDB,
    createUserInDB,
  };
};

const getUserFromDB = async (username: string): Promise<any> => {
  return await dbManager.getUserByUsername(username);
};

const createUserInDB = async (username: string): Promise<any> => {
  return await dbManager.createUser(username);
};

export const ensureUser = async (
  username: string,
  socket: any,
  dbManager: any
) => {
  try {
    console.log("Ensuring user exists:", username);

    // Check if user exists
    let user = await dbManager.getUserByUsername(username);

    if (user) {
      // console.log("User found:", user);
      socket?.emit("user:exists", user);
      return user;
    }

    // Create new user
    user = await dbManager.createUser(username);
    console.log("New user created:", user);
    socket?.emit("user:created", user);

    return user;
  } catch (error) {
    console.error("Auth error:", error);
    socket?.emit("auth:error", { message: "Authentication failed" });
    throw error;
  }
};

export const createEnsureUser =
  (db: DatabaseManager) =>
  async (username: string, socket?: Socket): Promise<any> => {
    try {
      logMessage("Ensuring user exists:", username);

      const user = await db.getUserByUsername(username);

      if (user) {
        // logMessage("User found:", user);
        emitIfSocket(socket, "user:exists", user);
        return user;
      }

      const newUser = await db.createUser(username);
      logMessage("New user created:", newUser);
      emitIfSocket(socket, "user:created", newUser);

      return newUser;
    } catch (error) {
      logError("Error in ensureUser:", error);
      emitIfSocket(socket, "auth:error", {
        message: "Failed to authenticate user",
      });
      throw error;
    }
  };

export const ensureUserLogic = async (
  username: string,
  getUser: (username: string) => Promise<any>,
  createUser: (username: string) => Promise<any>
): Promise<{ user: any; isNew: boolean }> => {
  const user = await getUser(username);

  if (user) {
    return { user, isNew: false };
  }

  const newUser = await createUser(username);
  return { user: newUser, isNew: true };
};

export const ensureUserWithEffects = async (
  username: string,
  socket?: Socket
): Promise<any> => {
  try {
    const { user, isNew } = await ensureUserLogic(
      username,
      getUserFromDB,
      createUserInDB
    );

    if (isNew) {
      logMessage("New user created:", user);
      emitIfSocket(socket, "user:created", user);
    } else {
      // logMessage("User found:", user);
      emitIfSocket(socket, "user:exists", user);
    }

    return user;
  } catch (error) {
    logError("Error in ensureUser:", error);
    emitIfSocket(socket, "auth:error", {
      message: "Failed to authenticate user",
    });
    throw error;
  }
};

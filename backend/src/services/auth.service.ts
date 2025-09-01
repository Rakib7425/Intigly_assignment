import { SocketManager } from "./SocketManager.ts";

export type User = {
  id: string;
  username: string;
};

export const authenticate = (
  socketManager: SocketManager,
  username: string
) => {
  socketManager.emit("authenticate", { username });
};

export const onAuthenticated = (
  socketManager: SocketManager,
  callback: (data: { username: string }) => void
) => {
  socketManager.on("authenticated", (data: unknown) => {
    callback(data as { username: string });
  });
};
export const ensureUser = (socketManager: SocketManager, username: string) => {
  socketManager.emit("ensureUser", { username });
};

export const onAuthError = (
  socketManager: SocketManager,
  callback: (error: { message: string }) => void
) => {
  socketManager.on("auth:error", (error: unknown) => {
    callback(error as { message: string });
  });
};

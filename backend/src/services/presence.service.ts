import { SocketManager } from "./SocketManager";

export const onActiveUsers = (
  socketManager: SocketManager,
  callback: (users: string[]) => void
) => {
  socketManager.on("activeUsers", (users: unknown) => {
    callback(users as string[]);
  });
};

export const updateCursor = (
  socketManager: SocketManager,
  documentId: number,
  cursor: any
) => {
  socketManager.emit("cursor", { documentId, cursor });
};

export const onCursorsUpdate = (
  socketManager: SocketManager,
  callback: (cursors: Record<string, any>) => void
) => {
  socketManager.on("cursorsUpdate", (cursors: unknown) => {
    callback(cursors as Record<string, any>);
  });
};

export const onPresenceUpdate = (
  socketManager: SocketManager,
  callback: (data: { presentUsers: string[] }) => void
) => {
  socketManager.on("presence:update", (data: unknown) => {
    callback(data as { presentUsers: string[] });
  });
};

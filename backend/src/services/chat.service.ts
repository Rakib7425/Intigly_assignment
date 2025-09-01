import { socketHandler } from "./socketHandler";

export const sendMessage = (
  socketManager: socketHandler,
  documentId: number,
  message: string
) => {
  socketManager.emit("sendMessage", { documentId, message });
};

export const onNewMessage = (
  socketManager: socketHandler,
  callback: (message: {
    id: number;
    documentId: number;
    username: string;
    message: string;
    createdAt: string;
  }) => void
) => {
  socketManager.on("chat:new", (message: unknown) => {
    callback(
      message as {
        id: number;
        documentId: number;
        username: string;
        message: string;
        createdAt: string;
      }
    );
  });
};

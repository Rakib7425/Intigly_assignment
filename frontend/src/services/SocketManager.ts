import { io, Socket } from "socket.io-client";

export class SocketManager {
  private socket: Socket | null = null;

  connect(username: string) {
    this.socket = io(
      import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3001",
      {
        transports: ["websocket", "polling"],
      }
    );

    this.socket.emit("authenticate", { username });

    this.socket.on("connect", () => {
      console.log("Connected to server");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

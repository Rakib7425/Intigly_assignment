import { io, Socket } from "socket.io-client";

export class SocketManager {
  private socket: Socket | null = null;
  private eventListeners: Map<string, Array<(...args: unknown[]) => void>> =
    new Map();

  connect(username: string) {
    if (this.socket) return; // avoid duplicate connections

    this.socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3001",
      {
        transports: ["websocket"],
      }
    );

    this.socket.on("connect", () => {
      console.log("✅ Connected to server");
      this.socket?.emit("authenticate", { username }); // FIX: send object
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });

    this.socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    this.socket.onAny((event, ...args) => {
      this.triggerEvent(event, ...args);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
  }

  emit(event: string, ...args: unknown[]) {
    this.socket?.emit(event, ...args);
  }

  on(event: string, callback: (...args: unknown[]) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  off(event: string, callback: (...args: unknown[]) => void) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  removeAllListeners() {
    this.eventListeners.clear();
  }

  private triggerEvent(event: string, ...args: unknown[]) {
    this.eventListeners.get(event)?.forEach((cb) => cb(...args));
  }
}

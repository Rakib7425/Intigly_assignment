import { io, Socket } from "socket.io-client";

export class SocketManager {
  private socket: Socket | null = null;
  private eventListeners: Map<string, Array<(...args: unknown[]) => void>> =
    new Map();

  connect(username: string) {
    if (this.socket) return; // prevent duplicate connections

    this.socket = io(process.env.VITE_SOCKET_URL || "http://localhost:3001", {
      transports: ["websocket" /*, 'polling'*/],
    });

    this.socket.on("connect", () => {
      console.log("✅ Connected to server");
      this.socket?.emit("authenticate", { username });
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });

    this.socket.on("connect_error", (err) => {
      console.error("⚠️ Socket connection error:", err.message);
    });

    // Forward every server event into our internal bus
    this.socket.onAny((event, ...args) => {
      this.triggerEvent(event, ...args);
    });
  }

  /**
   * Disconnect from server & cleanup.
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
  }

  /**
   * Emit an event to the server.
   */
  emit(event: string, ...args: unknown[]) {
    if (this.socket) {
      this.socket.emit(event, ...args);
    }
  }

  /**
   * Subscribe to an event.
   */
  on(event: string, callback: (...args: unknown[]) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  /**
   * Unsubscribe a specific callback from an event.
   */
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
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback(...args));
    }
  }
}

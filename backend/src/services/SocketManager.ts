// src/services/SocketManager.ts
import { io, Socket } from "socket.io-client";

export class SocketManager {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(
        import.meta.env.VITE_SERVER_URL || "http://localhost:3001",
        {
          transports: ["websocket", "polling"],
          timeout: 10000,
        }
      );

      this.socket.on("connect", () => {
        console.log("Connected to server");
        this.isConnected = true;
        this.socket?.emit("authenticate", { username });
        resolve();
      });

      this.socket.on("authenticated", (user) => {
        console.log("Authenticated:", user);
      });

      this.socket.on("connect_error", (error) => {
        console.error("Connection error:", error);
        reject(error);
      });

      this.socket.on("disconnect", () => {
        console.log("Disconnected from server");
        this.isConnected = false;
      });

      this.socket.on("auth:error", (error) => {
        console.error("Authentication error:", error);
        reject(error);
      });
    });
  }

  emit(event: string, data: any): void {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }
    this.socket.emit(event, data);
  }

  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.isConnected = false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.isConnected;
  }
}

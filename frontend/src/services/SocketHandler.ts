import { io, Socket } from "socket.io-client";

export class SocketHandler {
  private socket: Socket;

  constructor(private url: string) {
    this.socket = io(this.url, {
      autoConnect: false,
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {
      console.log("✅ Connected:", this.socket.id);
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Disconnected");
    });

    this.socket.on("connect_error", (err) => {
      console.error("⚠️ Connection error:", err.message);
    });
  }

  connect(onConnect?: () => void) {
    this.socket.connect();
    if (onConnect) {
      this.socket.once("connect", onConnect);
    }
  }

  emit(event: string, data?: any) {
    this.socket.emit(event, data);
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket.off(event, callback);
  }

  disconnect() {
    this.socket.disconnect();
  }
}
